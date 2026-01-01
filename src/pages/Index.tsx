import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseSidebar from '@/components/CourseSidebar';
import WeeklySchedule from '@/components/WeeklySchedule';
import { scheduledCourses } from '@/data/mockCourses';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const totalUnits = scheduledCourses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar on the right (RTL) */}
        <CourseSidebar />
        
        {/* Main content on the left (RTL) */}
        <WeeklySchedule />
      </div>
      
      <Footer totalUnits={totalUnits} />
    </div>
  );
};

export default Index;
