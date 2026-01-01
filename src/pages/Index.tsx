import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseSidebar from '@/components/CourseSidebar';
import WeeklySchedule from '@/components/WeeklySchedule';
import { Course } from '@/types/course';
import { scheduledCourses } from '@/data/mockCourses';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(() => 
    // Initialize with already scheduled courses
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar on the right (RTL) */}
        <CourseSidebar 
          selectedCourseIds={selectedCourseIds}
          onAddCourse={handleAddCourse}
          onRemoveCourse={handleRemoveCourse}
        />
        
        {/* Main content on the left (RTL) */}
        <WeeklySchedule />
      </div>
      
      <Footer totalUnits={totalUnits} />
    </div>
  );
};

export default Index;
