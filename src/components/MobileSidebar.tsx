import { useState, useMemo } from 'react';
import { Search, Plus, Filter, ChevronDown, Save, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import DepartmentCombobox from './DepartmentCombobox';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
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
import AddCourseDialog from './AddCourseDialog';
import { Gender, Course } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';
import { useGolestanData } from '@/hooks/useGolestanData';
import { normalizeText } from '@/lib/textNormalizer';

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileSidebar = ({ isOpen, onOpenChange }: MobileSidebarProps) => {
  const { selectedCourses, allCourses, clearAll, addCustomCourse, totalUnits } = useSchedule();
  const { isLoading, error, departments } = useGolestanData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | 'all' | null>(null);
  
  // Filter states
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [showGeneralOnly, setShowGeneralOnly] = useState(false);
  const [hideFull, setHideFull] = useState(false);

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      const isCustom = course.departmentId === 'custom';

      if (!isCustom) {
        if (!selectedDepartment) return false;
        if (course.departmentId !== selectedDepartment) return false;
      }

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

      return matchesSearch && matchesGender && matchesGeneral && matchesFull;
    });
  }, [normalizedQuery, gender, showGeneralOnly, hideFull, selectedDepartment, allCourses]);

  const customCoursesList = filteredCourses.filter(c => c.departmentId === 'custom');
  const availableToTake = filteredCourses.filter(
    c => c.category === 'available' && c.departmentId !== 'custom',
  );

  const handleSave = () => {
    if (selectedCourses.length === 0) {
      toast.info('برنامه خالی است');
      return;
    }
    toast.success('برنامه ذخیره شد', {
      description: `${selectedCourses.length} درس ذخیره شد`,
    });
  };

  const handleClearAll = () => {
    clearAll();
    toast.info('جدول پاک شد');
  };

  const handleAddCourse = (course: Course) => {
    addCustomCourse(course);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
        <div className="flex flex-col h-full" dir="rtl">
          {/* Header with drag handle */}
          <div className="flex flex-col items-center pt-2 pb-3 border-b border-border">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mb-3" />
            <div className="flex items-center justify-between w-full px-4">
              <SheetTitle className="text-base font-bold">لیست دروس</SheetTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {totalUnits} واحد
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedCourses.length} درس
                </Badge>
              </div>
            </div>
          </div>

          {/* Department Selector - same combobox UX as desktop */}
          <div className="px-4 py-3 border-b border-border/50">
            <DepartmentCombobox
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              departments={departments}
              placeholder="انتخاب دانشکده/رشته"
            />
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی درس، استاد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-11 text-sm bg-muted/30"
              />
            </div>
          </div>

          {/* Course List */}
          <ScrollArea className="flex-1 px-2">
            {isLoading && (
              <p className="text-center text-muted-foreground text-sm py-12">
                در حال بارگذاری دروس...
              </p>
            )}

            {!isLoading && error && (
              <p className="text-center text-destructive text-sm py-12">
                خطا در دریافت دروس
              </p>
            )}

            {!isLoading && !error && !selectedDepartment && customCoursesList.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-12 px-4">
                برای مشاهده دروس، ابتدا دانشکده/رشته را از بالای لیست انتخاب کن.
              </p>
            )}

            {!isLoading && !error && (selectedDepartment || customCoursesList.length > 0) && (
              <>
                {customCoursesList.length > 0 && (
                  <div>
                    <div className="sticky top-0 z-10 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 border-b border-emerald-500/30 mx-2 rounded-t-lg">
                      دروس اضافه شده توسط شما ({customCoursesList.length})
                    </div>
                    <div className="space-y-1 p-2">
                      {customCoursesList.map(course => (
                        <SidebarCourseItem key={course.id} course={course} />
                      ))}
                    </div>
                  </div>
                )}

                {availableToTake.length > 0 && (
                  <div>
                    <div className="sticky top-0 z-10 bg-primary/10 px-3 py-2 text-xs font-bold text-primary border-b border-primary/20 mx-2 rounded-t-lg">
                      دروس قابل اخذ ({availableToTake.length})
                    </div>
                    <div className="space-y-1 p-2">
                      {availableToTake.map(course => (
                        <SidebarCourseItem key={course.id} course={course} />
                      ))}
                    </div>
                  </div>
                )}

                {filteredCourses.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-12">
                    درسی یافت نشد
                  </p>
                )}
              </>
            )}
          </ScrollArea>

          {/* Bottom Actions - Touch Friendly */}
          <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm space-y-3">
            {/* Add Course */}
            <AddCourseDialog onAddCourse={handleAddCourse} />
            
            {/* Save & Clear */}
            <div className="flex gap-3">
              <Button 
                variant="default" 
                size="lg" 
                className="flex-1 h-12 text-sm gap-2"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                ذخیره برنامه
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-12 gap-2 text-sm text-destructive hover:text-destructive px-4"
                    disabled={selectedCourses.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                    پاک‌سازی
                  </Button>
                </AlertDialogTrigger>
                
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>پاک‌سازی جدول</AlertDialogTitle>
                    <AlertDialogDescription>
                      آیا مطمئن هستید؟ تمام دروس انتخاب شده حذف خواهند شد.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="h-11">انصراف</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAll}
                      className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      پاک کردن
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
