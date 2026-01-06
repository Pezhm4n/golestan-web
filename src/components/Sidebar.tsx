import { useState, useMemo, useRef, useCallback } from 'react';
import { Search, ChevronDown, Filter, Save, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const { selectedCourses, allCourses, clearAll, restoreCourses, addCustomCourse, saveSchedule } = useSchedule();
  const { isLoading, error, departments } = useGolestanData();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dir = i18n.dir();
  const isRtl = dir === 'rtl';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | 'all' | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Filter states
  const [timeFrom, setTimeFrom] = useState(7);
  const [timeTo, setTimeTo] = useState(20);
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [showGeneralOnly, setShowGeneralOnly] = useState(false);
  const [hideFull, setHideFull] = useState(false);

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      const isCustom = course.departmentId === 'custom';

      // Department filter: apply only to non-custom courses
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
      const matchesTime =
        course.sessions.every(
          s => Number(s.startTime) >= timeFrom && Number(s.endTime) <= timeTo,
        );

      return (
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

  const customCoursesList = filteredCourses.filter(c => c.departmentId === 'custom');
  const availableToTake = filteredCourses.filter(
    c => c.category === 'available' && c.departmentId !== 'custom',
  );
  const otherCourses = filteredCourses.filter(
    c => c.category === 'other' && c.departmentId !== 'custom',
  );

  const handleSave = () => {
    if (selectedCourses.length === 0) {
      toast.info(t('sidebar.saveScheduleEmpty'));
      return;
    }
    setScheduleName('');
    setSaveError(null);
    setIsSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    const trimmed = scheduleName.trim();
    if (!trimmed) {
      setSaveError(t('sidebar.saveScheduleInvalid'));
      return;
    }

    saveSchedule(trimmed);
    setIsSaveDialogOpen(false);
    setScheduleName('');
    setSaveError(null);

    // Hint حمایت (فقط اولین بار)
    const hasSeenDonateHint = localStorage.getItem('golestan-donate-hint');
    if (!hasSeenDonateHint) {
      localStorage.setItem('golestan-donate-hint', 'true');
      setTimeout(() => {
        toast(t('sidebar.donateHint'), {
          action: {
            label: t('sidebar.donateLabel'),
            onClick: () => {
              navigate('/donate');
            },
          },
          duration: 8000,
        });
      }, 1500);
    }
  };

  const handleClearAll = () => {
    const backup = [...selectedCourses];
    if (backup.length === 0) return;

    clearAll();

    toast.custom(
      (id) => (
        <div className="flex flex-row items-center justify-between w-full max-w-md gap-4 p-4 border rounded-lg shadow-lg bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('schedule.cleared')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('schedule.clearedWithCount', { count: backup.length })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t('schedule.undoHint')}
            </p>
          </div>
          <button
            onClick={() => {
              restoreCourses(prev => {
                const existingIds = new Set(prev.map(c => c.id));
                const uniqueBackup = backup.filter(c => !existingIds.has(c.id));
                return [...prev, ...uniqueBackup];
              });
              toast.dismiss(id);
            }}
            className="px-3 py-1.5 text-xs font-medium text-white transition-colors bg-black rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {t('common.undo')}
          </button>
        </div>
      ),
      { duration: 5000 },
    );
  };

  const handleAddCourse = (course: Course) => {
    addCustomCourse(course);
  };

  return (
    <aside
      data-tour="sidebar"
      dir={dir}
      className="w-[320px] border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shrink-0 rounded-l-xl overflow-hidden"
    >
      {/* Department Selector - searchable combobox grouped by faculty */}
      <div className="px-2 pt-2 pb-1">
        <DepartmentCombobox
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          departments={departments}
          placeholder={t('sidebar.departmentPlaceholder')}
        />
      </div>
      
      {/* Search - connected to department selector */}
      <div className="px-2 pb-2 border-b border-border/50">
        <div className="relative">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground ${
              isRtl ? 'right-2.5' : 'left-2.5'
            }`}
          />
          <Input
            placeholder={t('sidebar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-8 text-xs bg-background/50 ${
              isRtl ? 'pr-8 pl-2' : 'pl-8 pr-2'
            }`}
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
              {t('sidebar.filters')}
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
            {t('sidebar.loadingCourses')}
          </div>
        )}

        {!isLoading && error && (
          <div className="p-2 text-[11px] text-destructive bg-destructive/10 border border-destructive/40 rounded-md">
            {t('sidebar.loadErrorPrefix')} {error.message || t('sidebar.loadErrorFallback')}
          </div>
        )}

        {!isLoading && !error && !selectedDepartment && customCoursesList.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground px-3 text-center">
            {t('sidebar.selectDepartmentHint')}
          </div>
        )}

        {!isLoading && !error && (selectedDepartment || customCoursesList.length > 0) && (
          <ScrollArea className="h-full overflow-x-auto">
            {/* اجازه‌ی اسکرول افقی در صورت وجود درس با نام بسیار بلند */}
            {/* Custom/User Courses */}
            {customCoursesList.length > 0 && (
              <div>
                <div
                  className="sticky top-0 z-10 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-700 border-b border-emerald-500/30"
                >
                  {t('sidebar.customCoursesHeader')} ({customCoursesList.length})
                </div>
                <VirtualizedCourseList courses={customCoursesList} />
              </div>
            )}

            {/* Available/Allowed Courses */}
            {availableToTake.length > 0 && (
              <div>
                <div
                  data-tour="available-courses"
                  className="sticky top-0 z-10 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary border-b border-primary/20"
                >
                  {t('sidebar.availableCoursesHeader')} ({availableToTake.length})
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
                  {t('sidebar.otherCoursesHeader')} ({otherCourses.length})
                </div>
                <VirtualizedCourseList courses={otherCourses} />
              </div>
            )}

            {filteredCourses.length === 0 && (
              <p className="text-center text-muted-foreground text-[10px] py-8">
                {t('sidebar.noCoursesFound')}
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
            {t('sidebar.saveSchedule')}
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
                {t('sidebar.clear')}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('sidebar.clearConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('sidebar.clearConfirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel>{t('sidebar.clearConfirmCancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('sidebar.clearConfirmOk')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Save schedule dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent dir={dir} className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {t('sidebar.saveDialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-[11px] text-muted-foreground">
              {t('sidebar.saveDialogLabel')}
            </label>
            <Input
              autoFocus
              value={scheduleName}
              onChange={(e) => {
                setScheduleName(e.target.value);
                if (saveError) setSaveError(null);
              }}
              placeholder={t('sidebar.saveDialogPlaceholder')}
              className="h-9 text-xs"
            />
            {saveError && (
              <p className="text-[11px] text-destructive mt-1">
                {saveError}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              {t('sidebar.saveDialogDescription')}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setScheduleName('');
                setSaveError(null);
              }}
            >
              {t('sidebar.saveDialogCancel')}
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={handleConfirmSave}
            >
              {t('sidebar.saveDialogConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default Sidebar;
