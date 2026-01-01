import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import ScheduleGrid from '@/components/ScheduleGrid';
import { Course } from '@/types/course';
import { scheduledCourses } from '@/data/mockCourses';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(() => 
    scheduledCourses.map(c => c.id)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAddCourse = (course: Course) => {
    if (!selectedCourseIds.includes(course.id)) {
      setSelectedCourseIds(prev => [...prev, course.id]);
    }
  };

  const handleRemoveCourse = (course: Course) => {
    setSelectedCourseIds(prev => prev.filter(id => id !== course.id));
  };

  const totalUnits = useMemo(() => {
    return scheduledCourses.reduce((sum, course) => sum + course.credits, 0);
  }, []);

  const courseCount = useMemo(() => {
    return scheduledCourses.length;
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Fixed Header - 50px */}
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar - Fixed 350px (Right in RTL) */}
        <Sidebar 
          selectedCourseIds={selectedCourseIds}
          onAddCourse={handleAddCourse}
          onRemoveCourse={handleRemoveCourse}
        />
        
        {/* Schedule Grid - Takes remaining space (Left in RTL) */}
        <ScheduleGrid />
      </div>
      
      {/* Fixed Footer - 30px */}
      <Footer totalUnits={totalUnits} courseCount={courseCount} />
    </div>
  );
};

export default Index;