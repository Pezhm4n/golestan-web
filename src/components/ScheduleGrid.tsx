import React from 'react';
import { DAYS, ScheduledCourse } from '@/types/course';
import { scheduledCourses } from '@/data/mockCourses';
import CourseCell from './CourseCell';

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i); // 07:00 to 20:00

const ScheduleGrid = () => {
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
  const HEADER_HEIGHT = 40;
  const TIME_COL_WIDTH = 60;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      {/* Grid Container - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div 
          className="min-w-[800px]"
          style={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(6, minmax(0, 1fr))`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          {/* ========== STICKY HEADER ROW ========== */}
          
          {/* Time Column Header */}
          <div 
            className="sticky top-0 z-20 bg-muted border border-border flex items-center justify-center"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span className="text-[10px] font-bold text-muted-foreground">ساعت</span>
          </div>

          {/* Day Headers */}
          {DAYS.map((day, dayIndex) => (
            <div
              key={`header-${day}`}
              className="sticky top-0 z-20 bg-muted border-t border-b border-l border-border flex items-center justify-center font-bold text-[11px] text-foreground"
              style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {/* ========== TIME ROWS ========== */}
          {TIME_SLOTS.map((time, rowIndex) => (
            <React.Fragment key={`row-${time}`}>
              {/* Time Label Cell */}
              <div
                className="bg-muted/70 border-l border-b border-border flex items-center justify-center text-[10px] text-muted-foreground font-mono"
                style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
              >
                {formatTime(time)}
              </div>

              {/* Day Cells */}
              {DAYS.map((_, dayIndex) => {
                const courses = getCoursesForSlot(dayIndex, time);
                const isOccupied = isCellOccupiedByPreviousCourse(dayIndex, time);

                // Skip if occupied by a spanning course
                if (isOccupied) {
                  return null;
                }

                const mainCourse = courses[0];
                const rowSpan = mainCourse ? mainCourse.endTime - mainCourse.startTime : 1;

                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className={`
                      relative border-l border-b border-border
                      ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10'}
                      hover:bg-accent/30 transition-colors
                    `}
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: rowSpan > 1 
                        ? `${rowIndex + 2} / span ${rowSpan}` 
                        : rowIndex + 2,
                    }}
                  >
                    <CourseCell courses={courses} rowSpan={rowSpan} />
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

export default ScheduleGrid;