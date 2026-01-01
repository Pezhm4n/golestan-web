import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import ScheduleGrid from '@/components/ScheduleGrid';
import { ScheduleProvider } from '@/contexts/ScheduleContext';

const ScheduleApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      
      <div className="flex-1 flex overflow-hidden min-h-0 mb-10">
        <Sidebar />
        <ScheduleGrid />
      </div>
      
      {/* Fixed Footer with Stats & Conflict Status */}
      <Footer />
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
