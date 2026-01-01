import { useState, useMemo } from 'react';
import { Search, ChevronDown, ListChecks, Library, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import SidebarCourseItem from './SidebarCourseItem';
import SidebarActions from './SidebarActions';
import CompactFilterPanel from './CompactFilterPanel';
import { Gender } from '@/types/course';
import { availableCourses, departments } from '@/data/mockCourses';
import { useSchedule } from '@/contexts/ScheduleContext';

const Sidebar = () => {
  const { selectedCourses } = useSchedule();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('1');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter states
  const [timeFrom, setTimeFrom] = useState(7);
  const [timeTo, setTimeTo] = useState(20);
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [showGeneralOnly, setShowGeneralOnly] = useState(false);
  const [hideFull, setHideFull] = useState(false);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course => {
      const matchesSearch = course.name.includes(searchQuery) ||
        course.instructor.includes(searchQuery) ||
        course.courseId.includes(searchQuery);
      const matchesGender = gender === 'all' || course.gender === gender;
      const matchesGeneral = !showGeneralOnly || course.isGeneral;
      const matchesFull = !hideFull || course.enrolled < course.capacity;
      return matchesSearch && matchesGender && matchesGeneral && matchesFull;
    });
  }, [searchQuery, gender, showGeneralOnly, hideFull]);

  const availableToTake = filteredCourses.filter(c => c.category === 'available');
  const otherCourses = filteredCourses.filter(c => c.category === 'other');

  return (
    <aside className="w-[350px] border-r border-border bg-card/50 backdrop-blur-sm flex flex-col shrink-0 rounded-r-xl overflow-hidden">
      {/* Department Selector */}
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="h-9 text-xs font-medium">
            <SelectValue placeholder="انتخاب دانشکده/رشته" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.id} className="text-xs">
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <SidebarActions />
      
      {/* Search */}
      <div className="p-2 border-b border-border/50">
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
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
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
      
      {/* Tabs */}
      <Tabs defaultValue="available" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-border/50 h-8 bg-transparent p-0">
          <TabsTrigger 
            value="available" 
            className="flex-1 h-full rounded-none text-[10px] gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Library className="h-3 w-3" />
            ارائه شده ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger 
            value="selected" 
            className="flex-1 h-full rounded-none text-[10px] gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ListChecks className="h-3 w-3" />
            اخذ شده ({selectedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            {/* Available/Allowed Courses */}
            {availableToTake.length > 0 && (
              <div>
                <div className="sticky top-0 z-10 bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary border-b border-primary/20">
                  دروس قابل اخذ ({availableToTake.length})
                </div>
                {availableToTake.map(course => (
                  <SidebarCourseItem key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Other Courses */}
            {otherCourses.length > 0 && (
              <div>
                <div className="sticky top-0 z-10 bg-muted/80 px-3 py-1.5 text-[10px] font-bold text-muted-foreground border-b border-border/30">
                  سایر دروس ({otherCourses.length})
                </div>
                {otherCourses.map(course => (
                  <SidebarCourseItem key={course.id} course={course} />
                ))}
              </div>
            )}

            {filteredCourses.length === 0 && (
              <p className="text-center text-muted-foreground text-[10px] py-8">
                درسی یافت نشد
              </p>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="selected" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            {selectedCourses.length > 0 ? (
              selectedCourses.map(course => (
                <SidebarCourseItem key={course.id} course={course} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-[11px]">درسی انتخاب نشده</p>
                <p className="text-muted-foreground text-[9px] mt-1">برای افزودن درس، روی آن کلیک کنید</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default Sidebar;
