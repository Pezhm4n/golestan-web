import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import ScheduleGrid from '@/components/ScheduleGrid';
import AlertBanner from '@/components/AlertBanner';
import { ScheduleProvider, useSchedule } from '@/contexts/ScheduleContext';

const ScheduleApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { totalUnits, selectedCourses } = useSchedule();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted/30">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
      {/* Alert Banner */}
      <AlertBanner />
      
      <div className="flex-1 flex overflow-hidden min-h-0">
        <ScheduleGrid />
        <Sidebar />
      </div>
      
      <Footer totalUnits={totalUnits} courseCount={selectedCourses.length} />
    </div>
  );
};

const Index = () => {
  return (
    <ScheduleProvider>
      <ScheduleApp />
    </ScheduleProvider>
  );
};

export default Index;
