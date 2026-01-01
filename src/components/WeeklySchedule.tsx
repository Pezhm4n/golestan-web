import React from 'react';
import { DAYS, TIME_SLOTS, ScheduledCourse } from '@/types/course';
import { scheduledCourses } from '@/data/mockCourses';
import CourseBlock from './CourseBlock';

const WeeklySchedule = () => {
  const getCourseForSlot = (day: number, time: number): ScheduledCourse | undefined => {
    return scheduledCourses.find(
      course => course.day === day && course.startTime === time
    );
  };

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:۰۰`;
  };

  return (
    <div className="flex-1 p-4 overflow-auto bg-background">
      <div className="min-w-[800px] h-full">
        {/* Grid Container */}
        <div 
          className="grid h-full border border-border rounded-lg overflow-hidden bg-card"
          style={{
            gridTemplateColumns: '60px repeat(6, 1fr)',
            gridTemplateRows: '48px repeat(13, 1fr)'
          }}
        >
          {/* Empty corner cell */}
          <div className="bg-muted/30 border-b border-l border-border" />
          
          {/* Day headers */}
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="bg-muted/30 border-b border-l border-border flex items-center justify-center font-semibold text-sm text-foreground"
            >
              {day}
            </div>
          ))}
          
          {/* Time slots and cells */}
          {TIME_SLOTS.slice(0, 13).map((time) => (
            <React.Fragment key={`row-${time}`}>
              {/* Time label */}
              <div
                className="bg-muted/30 border-b border-l border-border flex items-center justify-center text-xs text-muted-foreground"
              >
                {formatTime(time)}
              </div>
              
              {/* Day cells for this time slot */}
              {DAYS.map((_, dayIndex) => {
                const course = getCourseForSlot(dayIndex, time);
                
                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className="relative border-b border-l border-border hover:bg-accent/20 transition-colors"
                  >
                    {course && <CourseBlock course={course} />}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
