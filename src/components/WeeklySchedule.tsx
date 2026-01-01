import React from 'react';
import { DAYS, TIME_SLOTS, ScheduledCourse } from '@/types/course';
import { scheduledCourses } from '@/data/mockCourses';
import CourseBlock from './CourseBlock';

const WeeklySchedule = () => {
  const getCoursesForSlot = (day: number, time: number): ScheduledCourse[] => {
    return scheduledCourses.filter(
      course => course.day === day && course.startTime === time
    );
  };

  const isCellOccupiedByPreviousCourse = (day: number, time: number): boolean => {
    return scheduledCourses.some(
      course => course.day === day && course.startTime < time && course.endTime > time
    );
  };

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:۰۰`;
  };

  const ROW_HEIGHT = 60;
  const timeSlots = TIME_SLOTS.slice(0, 13); // 07:00 to 19:00

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="h-full overflow-auto p-2">
        <div 
          className="min-w-[900px] border border-border rounded-lg overflow-hidden bg-card shadow-sm"
          style={{
            display: 'grid',
            gridTemplateColumns: '80px repeat(6, 1fr)',
            gridTemplateRows: `40px repeat(${timeSlots.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          {/* ========== HEADER ROW ========== */}
          
          {/* Cell 1: Time header (Column 1) */}
          <div 
            className="bg-muted border-b border-l border-border flex items-center justify-center sticky top-0 z-20"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span className="text-[11px] text-muted-foreground font-medium">ساعت</span>
          </div>

          {/* Cells 2-7: Day headers (Columns 2-7) */}
          {DAYS.map((day, dayIndex) => (
            <div
              key={`header-${day}`}
              className="bg-muted border-b border-l border-border flex items-center justify-center font-semibold text-xs text-foreground sticky top-0 z-20"
              style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {/* ========== TIME ROWS ========== */}
          {timeSlots.map((time, rowIndex) => (
            <React.Fragment key={`row-${time}`}>
              {/* Time Label (Column 1) */}
              <div
                className="bg-muted/50 border-b border-l border-border flex items-center justify-center text-[11px] text-muted-foreground font-mono"
                style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
              >
                {formatTime(time)}
              </div>

              {/* Day Cells (Columns 2-7) */}
              {DAYS.map((_, dayIndex) => {
                const courses = getCoursesForSlot(dayIndex, time);
                const isOccupied = isCellOccupiedByPreviousCourse(dayIndex, time);
                const hasDualCourse = courses.length === 2;

                // Skip if occupied by a spanning course from previous row
                if (isOccupied) {
                  return null;
                }

                // Calculate row span
                const mainCourse = courses[0];
                const rowSpan = mainCourse ? mainCourse.endTime - mainCourse.startTime : 1;

                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className={`
                      relative border-b border-l border-border/50 
                      hover:bg-accent/20 transition-colors
                      ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/5'}
                    `}
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: rowSpan > 1 ? `${rowIndex + 2} / span ${rowSpan}` : rowIndex + 2,
                    }}
                  >
                    {hasDualCourse ? (
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
  );
};

export default WeeklySchedule;
