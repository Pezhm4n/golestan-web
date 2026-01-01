import { useState, useMemo } from 'react';
import { Search, ListChecks, Library } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarCourseItem from './SidebarCourseItem';
import CompactFilterPanel from './CompactFilterPanel';
import { Gender } from '@/types/course';
import { availableCourses } from '@/data/mockCourses';
import { useSchedule } from '@/contexts/ScheduleContext';

const Sidebar = () => {
  const { selectedCourses } = useSchedule();
  const [searchQuery, setSearchQuery] = useState('');
  
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

  return (
    <aside className="w-[350px] border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="h-[30px] px-2 border-b border-border flex items-center bg-muted/50">
        <h2 className="text-[11px] font-bold text-foreground">لیست دروس</h2>
      </div>
      
      {/* Search */}
      <div className="p-1.5 border-b border-border">
        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-7 h-6 text-[11px]"
          />
        </div>
      </div>

      {/* Filters */}
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
      
      {/* Tabs */}
      <Tabs defaultValue="available" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-border h-7 bg-muted/30 p-0">
          <TabsTrigger 
            value="available" 
            className="flex-1 h-full rounded-none text-[10px] gap-1 data-[state=active]:bg-background"
          >
            <Library className="h-3 w-3" />
            ارائه شده ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger 
            value="selected" 
            className="flex-1 h-full rounded-none text-[10px] gap-1 data-[state=active]:bg-background"
          >
            <ListChecks className="h-3 w-3" />
            اخذ شده ({selectedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            {filteredCourses.map(course => (
              <SidebarCourseItem key={course.id} course={course} />
            ))}
            {filteredCourses.length === 0 && (
              <p className="text-center text-muted-foreground text-[10px] py-4">
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
              <p className="text-center text-muted-foreground text-[10px] py-4">
                درسی انتخاب نشده
              </p>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default Sidebar;