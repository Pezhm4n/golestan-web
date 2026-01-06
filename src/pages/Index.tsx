import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import MobileSidebar from '@/components/MobileSidebar';
import ScheduleGrid from '@/components/ScheduleGrid';
import UnscheduledCourses from '@/components/UnscheduledCourses';
import { ScheduleProvider, useSchedule } from '@/contexts/ScheduleContext';
import { useResponsive } from '@/hooks/use-responsive';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ScheduleApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { selectedCourses, totalUnits } = useSchedule();

  const showMobileSidebar = isMobile || isTablet;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted/30">
      <Header />
      
      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${showMobileSidebar ? 'mb-14' : 'mb-12'}`}>
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Desktop Sidebar */}
          {!showMobileSidebar && <Sidebar />}

          {/* Main schedule column: grid + unscheduled courses */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Schedule Grid */}
            <ScheduleGrid />

            {/* Unscheduled courses (e.g. internships, projects without time) */}
            <UnscheduledCourses courses={selectedCourses} />
          </div>
        </div>
      </div>
      
      {/* Mobile/Tablet Floating Action Button to open sidebar */}
      {showMobileSidebar && (
        <>
          <Button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-[4.5rem] right-4 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center p-0"
            size="lg"
          >
            <div className="relative">
              <BookOpen className="h-6 w-6" />
              {selectedCourses.length > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive"
                >
                  {selectedCourses.length}
                </Badge>
              )}
            </div>
          </Button>
          
          <MobileSidebar 
            isOpen={isSidebarOpen} 
            onOpenChange={setIsSidebarOpen} 
          />
        </>
      )}
      
      {/* Fixed Footer with Stats & Conflict Status */}
      <Footer isMobile={showMobileSidebar} />
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
