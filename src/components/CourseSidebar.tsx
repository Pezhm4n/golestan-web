import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, ListChecks, Library } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import CourseCard from './CourseCard';
import FilterPanel from './FilterPanel';
import { Course, Gender } from '@/types/course';
import { availableCourses } from '@/data/mockCourses';

interface CourseSidebarProps {
  selectedCourseIds: string[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (course: Course) => void;
}

const CourseSidebar = ({ selectedCourseIds, onAddCourse, onRemoveCourse }: CourseSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [timeFrom, setTimeFrom] = useState(7);
  const [timeTo, setTimeTo] = useState(20);
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [showGeneralOnly, setShowGeneralOnly] = useState(false);
  const [hideFull, setHideFull] = useState(false);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course => {
      // Search filter
      const matchesSearch = course.name.includes(searchQuery) ||
        course.instructor.includes(searchQuery) ||
        course.courseId.includes(searchQuery);
      
      // Gender filter
      const matchesGender = gender === 'all' || course.gender === gender;
      
      // General courses filter
      const matchesGeneral = !showGeneralOnly || course.isGeneral;
      
      // Full courses filter
      const matchesFull = !hideFull || course.enrolled < course.capacity;

      return matchesSearch && matchesGender && matchesGeneral && matchesFull;
    });
  }, [searchQuery, gender, showGeneralOnly, hideFull]);

  const selectedCourses = useMemo(() => {
    return availableCourses.filter(course => selectedCourseIds.includes(course.id));
  }, [selectedCourseIds]);

  const totalUnits = useMemo(() => {
    return selectedCourses.reduce((sum, course) => sum + course.credits, 0);
  }, [selectedCourses]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (timeFrom > 7 || timeTo < 20) count++;
    if (gender !== 'all') count++;
    if (showGeneralOnly) count++;
    if (hideFull) count++;
    return count;
  }, [timeFrom, timeTo, gender, showGeneralOnly, hideFull]);

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-3">
        <h2 className="text-base font-bold text-card-foreground">
          لیست دروس
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="جستجو نام، استاد یا کد درس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8 h-8 text-xs"
          />
        </div>
        
        {/* Filter Toggle */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full h-8 gap-2 text-xs">
              <Filter className="h-3.5 w-3.5" />
              <span>فیلتر دروس</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
              {isFilterOpen ? (
                <ChevronUp className="h-3.5 w-3.5 mr-auto" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 mr-auto" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <FilterPanel
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
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="available" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-border h-9 bg-muted/30 p-0">
          <TabsTrigger 
            value="available" 
            className="flex-1 h-full rounded-none text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-none"
          >
            <Library className="h-3.5 w-3.5" />
            دروس ارائه شده
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {filteredCourses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="selected" 
            className="flex-1 h-full rounded-none text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-none"
          >
            <ListChecks className="h-3.5 w-3.5" />
            دروس اخذ شده
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {selectedCourses.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Available Courses Tab */}
        <TabsContent value="available" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSelected={selectedCourseIds.includes(course.id)}
                  onAdd={onAddCourse}
                  onRemove={onRemoveCourse}
                />
              ))}
              
              {filteredCourses.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-8">
                  درسی یافت نشد
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Selected Courses Tab */}
        <TabsContent value="selected" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {selectedCourses.length > 0 ? (
                <>
                  {/* Summary */}
                  <div className="p-2 bg-muted/50 rounded-lg border border-border mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">تعداد دروس:</span>
                      <span className="font-medium">{selectedCourses.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">مجموع واحد:</span>
                      <span className="font-bold text-primary">{totalUnits} واحد</span>
                    </div>
                  </div>
                  
                  {selectedCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isSelected={true}
                      onRemove={onRemoveCourse}
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <ListChecks className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-xs">
                    هنوز درسی انتخاب نشده
                  </p>
                  <p className="text-muted-foreground/70 text-[10px] mt-1">
                    از تب دروس ارائه شده، درس اضافه کنید
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default CourseSidebar;
