import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import CourseCard from './CourseCard';
import { Course } from '@/types/course';
import { availableCourses } from '@/data/mockCourses';

const CourseSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = availableCourses.filter(course =>
    course.name.includes(searchQuery) ||
    course.instructor.includes(searchQuery)
  );

  const handleAddCourse = (course: Course) => {
    console.log('Adding course:', course.name);
    // Logic will be added later
  };

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground mb-3">
          لیست دروس
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        
        {/* Filter Button */}
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Filter className="h-4 w-4" />
          <span>فیلتر دروس</span>
        </Button>
      </div>
      
      {/* Course List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onAdd={handleAddCourse}
            />
          ))}
          
          {filteredCourses.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              درسی یافت نشد
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default CourseSidebar;
