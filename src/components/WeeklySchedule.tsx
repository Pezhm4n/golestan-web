import React from 'react';
import { DAYS, TIME_SLOTS, ScheduledCourse } from '@/types/course';
import { scheduledCourses } from '@/data/mockCourses';
import CourseBlock from './CourseBlock';

const WeeklySchedule = () => {
  // Get courses for a specific day and time slot
  const getCoursesForSlot = (day: number, time: number): ScheduledCourse[] => {
    return scheduledCourses.filter(
      course => course.day === day && course.startTime === time
    );
  };

  // Check if a cell is occupied by a multi-hour course
  const isCellOccupied = (day: number, time: number): boolean => {
    return scheduledCourses.some(
      course => course.day === day && course.startTime < time && course.endTime > time
    );
  };

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:۰۰`;
  };

  const ROW_HEIGHT = 60; // Fixed row height in pixels

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="h-full overflow-auto">
        <div className="min-w-[900px] h-full p-2">
          {/* Grid Container with sticky headers */}
          <div 
            className="relative border border-border rounded-lg overflow-hidden bg-card shadow-sm"
            style={{
              display: 'grid',
              gridTemplateColumns: '50px repeat(6, 1fr)',
              gridTemplateRows: `36px repeat(13, ${ROW_HEIGHT}px)`,
            }}
          >
            {/* Sticky corner cell */}
            <div 
              className="sticky top-0 right-0 z-30 bg-muted border-b border-l border-border flex items-center justify-center"
            >
              <span className="text-[10px] text-muted-foreground font-medium">ساعت</span>
            </div>
            
            {/* Sticky Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="sticky top-0 z-20 bg-muted border-b border-l border-border flex items-center justify-center font-semibold text-xs text-foreground"
              >
                {day}
              </div>
            ))}
            
            {/* Time slots and cells */}
            {TIME_SLOTS.slice(0, 13).map((time, rowIndex) => (
              <React.Fragment key={`row-${time}`}>
                {/* Sticky Time label */}
                <div
                  className="sticky right-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-l border-border flex items-center justify-center text-[10px] text-muted-foreground font-mono"
                >
                  {formatTime(time)}
                </div>
                
                {/* Day cells for this time slot */}
                {DAYS.map((_, dayIndex) => {
                  const courses = getCoursesForSlot(dayIndex, time);
                  const isOccupied = isCellOccupied(dayIndex, time);
                  const hasDualCourse = courses.length === 2;
                  
                  // Skip rendering content if cell is occupied by multi-hour course
                  if (isOccupied) {
                    return (
                      <div
                        key={`cell-${dayIndex}-${time}`}
                        className="border-b border-l border-border/50"
                      />
                    );
                  }

                  // Calculate row span for multi-hour courses
                  const courseWithSpan = courses[0];
                  const rowSpan = courseWithSpan ? courseWithSpan.endTime - courseWithSpan.startTime : 1;
                  
                  return (
                    <div
                      key={`cell-${dayIndex}-${time}`}
                      className={`
                        relative border-b border-l border-border/50 
                        hover:bg-accent/30 transition-colors
                        ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10'}
                      `}
                      style={{
                        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
                        minHeight: rowSpan > 1 ? `${ROW_HEIGHT * rowSpan}px` : undefined,
                      }}
                    >
                      {hasDualCourse ? (
                        // Split view for dual courses (odd/even weeks)
                        <>
                          <CourseBlock 
                            course={courses.find(c => c.weekType === 'odd') || courses[0]} 
                            isSplit={true}
                            position="top"
                          />
                          <CourseBlock 
                            course={courses.find(c => c.weekType === 'even') || courses[1]} 
                            isSplit={true}
                            position="bottom"
                          />
                        </>
                      ) : courses.length === 1 ? (
                        // Single course
                        <CourseBlock course={courses[0]} />
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
