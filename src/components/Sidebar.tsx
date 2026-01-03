import { useState, useMemo, useRef } from 'react';
import { Search, ChevronDown, Filter, Save, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import SidebarCourseItem from './SidebarCourseItem';
import CompactFilterPanel from './CompactFilterPanel';
import AddCourseDialog from './AddCourseDialog';
import { Gender, Course } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';
import { useGolestanData } from '@/hooks/useGolestanData';
import { normalizeText } from '@/lib/textNormalizer';
import DepartmentCombobox from './DepartmentCombobox';

interface VirtualizedCourseListProps {
  courses: Course[];
}

const VirtualizedCourseList = ({ courses }: VirtualizedCourseListProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: courses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // approximate item height
    overscan: 10,
  });

  // For small lists, render directly (still call hooks above to satisfy rules of hooks)
  if (courses.length < 100) {
    return (
      <div>
        {courses.map((course) => (
          <SidebarCourseItem key={course.id} course={course} />
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="max-h-[600px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const course = courses[virtualRow.index];
          return (
            <div
              key={course.id}
              className="absolute top-0 left-0 right-0"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <SidebarCourseItem course={course} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { selectedCourses, allCourses, clearAll, addCustomCourse } = useSchedule();
  const { isLoading, error, departments } = useGolestanData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter states
  const [timeFrom, setTimeFrom] = useState(7);
  const [timeTo, setTimeTo] = useState(20);
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [showGeneralOnly, setShowGeneralOnly] = useState(false);
  const [hideFull, setHideFull] = useState(false);

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      // Filter by department (no-op until real department mapping is wired)
      const matchesDepartment =
        selectedDepartment === 'all' || course.departmentId === selectedDepartment;
      
      const normName = normalizeText(course.name);
      const normInstructor = normalizeText(course.instructor);
      const normCode = normalizeText(course.courseId);

      const matchesSearch =
        !normalizedQuery ||
        normName.includes(normalizedQuery) ||
        normInstructor.includes(normalizedQuery) ||
        normCode.includes(normalizedQuery);

      const matchesGender = gender === 'all' || course.gender === gender;
      const matchesGeneral = !showGeneralOnly || course.isGeneral;
      const matchesFull = !hideFull || course.enrolled < course.capacity;
      const matchesTime =
        course.sessions.every(
          s => s.startTime >= timeFrom && s.endTime <= timeTo,
        );

      return (
        matchesDepartment &&
        matchesSearch &&
        matchesGender &&
        matchesGeneral &&
        matchesFull &&
        matchesTime
      );
    });
  }, [
    allCourses,
    selectedDepartment,
    normalizedQuery,
    gender,
    showGeneralOnly,
    hideFull,
    timeFrom,
    timeTo,
  ]);

  const availableToTake = filteredCourses.filter(c => c.category === 'available');
  const otherCourses = filteredCourses.filter(c => c.category === 'other');

  const handleSave = () => {
    if (selectedCourses.length === 0) {
      toast.info('برنامه خالی است');
      return;
    }
    
    // Check if this is the first save
    const hasSeenDonateHint = localStorage.getItem('golestan-donate-hint');
    
    toast.success('برنامه ذخیره شد', {
      description: `${selectedCourses.length} درس ذخیره شد`,
    });

    // Show donate hint after first save
    if (!hasSeenDonateHint) {
      localStorage.setItem('golestan-donate-hint', 'true');
      setTimeout(() => {
        toast('اگه این ابزار بهت کمک کرد، می‌تونی از ما حمایت کنی 💙', {
          action: {
            label: 'حمایت',
            onClick: () => window.location.href = '/donate',
          },
          duration: 8000,
        });
      }, 1500);
    }
  };

  const handleClearAll = () => {
    clearAll();
    toast.info('جدول پاک شد');
  };

  const handleAddCourse = (course: Course) => {
    addCustomCourse(course);
  };

  return (
    <aside data-tour="sidebar" dir="rtl" className="w-[320px] border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shrink-0 rounded-l-xl overflow-hidden">
      {/* Department Selector - searchable combobox grouped by faculty */}
      <div className="px-2 pt-2 pb-1">
        <DepartmentCombobox
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          departments={departments}
          placeholder="انتخاب دانشکده/رشته"
        />
      </div>
      
      {/* Search - connected to department selector */}
      <div className="px-2 pb-2 border-b border-border/50">
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="جستجوی درس، استاد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 h-8 text-xs bg-background/50"
          />
        </div>
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} data-tour="filters">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full h-8 justify-between px-3 text-[11px] text-muted-foreground hover:text-foreground rounded-none border-b border-border/50"
          >
            <span className="flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              فیلترها
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CompactFilterPanel
            timeFrom={timeFrom}
            timeTo={timeTo}
            gender={gender}
            showGeneralOnly={showGeneralOnly}
            hideFull={hideFull}
            onTimeFromChange={setTimeFrom}
            onTimeToChange={setTimeTo}
            onGenderChange={setGender}
            onShowGeneralOnlyChange={setShowGeneralOnly}
            onHideFullChange={setHideFull}
          />
        </CollapsibleContent>
      </Collapsible>
      
      {/* Course List - Only Available */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground">
            در حال بارگذاری دروس...
          </div>
        )}

        {!isLoading && error && (
          <div className="p-2 text-[11px] text-destructive bg-destructive/10 border border-destructive/40 rounded-md">
            خطا در دریافت دروس: {error.message || 'امکان برقراری ارتباط با سرور وجود ندارد.'}
          </div>
        )}

        {!isLoading && !error && (
          <ScrollArea className="h-full">
            {/* Available/Allowed Courses */}
            {availableToTake.length > 0 && (
              <div>
                <div
                  data-tour="available-courses"
                  className="sticky top-0 z-10 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary border-b border-primary/20"
                >
                  دروس قابل اخذ ({availableToTake.length})
                </div>
                <VirtualizedCourseList courses={availableToTake} />
              </div>
            )}

            {/* Other Courses */}
            {otherCourses.length > 0 && (
              <div>
                <div
                  data-tour="unavailable-courses"
                  className="sticky top-0 z-10 bg-muted/80 px-3 py-1.5 text-[10px] font-bold text-muted-foreground border-b border-border/30"
                >
                  دروس غیر قابل اخذ ({otherCourses.length})
                </div>
                <VirtualizedCourseList courses={otherCourses} />
              </div>
            )}

            {filteredCourses.length === 0 && (
              <p className="text-center text-muted-foreground text-[10px] py-8">
                درسی یافت نشد
              </p>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Bottom Actions */}
      <div data-tour="actions" className="p-2 border-t border-border/50 bg-muted/30 flex flex-col gap-2">
        {/* Add Course Button */}
        <AddCourseDialog onAddCourse={handleAddCourse} />
        
        {/* Save & Clear Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 h-8 text-xs gap-1.5"
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5" />
            ذخیره برنامه
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                disabled={selectedCourses.length === 0}
              >
                <Trash2 className="h-3.5 w-3.5" />
                پاک‌سازی
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>پاک‌سازی جدول</AlertDialogTitle>
                <AlertDialogDescription>
                  آیا مطمئن هستید؟ تمام دروس انتخاب شده از برنامه حذف خواهند شد.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel>انصراف</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  پاک کردن
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
