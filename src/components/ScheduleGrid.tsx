import React from 'react';
import { DAYS, ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import CourseCell from './CourseCell';
import { cn } from '@/lib/utils';

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i);

const ScheduleGrid = () => {
  const { scheduledSessions, hoveredCourseId, allCourses } = useSchedule();
  const { showGridLines, getFontSizeClass } = useSettings();

  // Get the hovered course's sessions for preview highlighting
  const hoveredCourse = hoveredCourseId 
    ? allCourses.find(c => c.id === hoveredCourseId) 
    : null;

  const getSessionsForSlot = (day: number, time: number): ScheduledSession[] => {
    return scheduledSessions.filter(
      session => session.day === day && session.startTime === time
    );
  };

  const isCellOccupiedByPrevious = (day: number, time: number): boolean => {
    return scheduledSessions.some(
      session => session.day === day && session.startTime < time && session.endTime > time
    );
  };

  // Check if this cell would be occupied by the hovered course
  const isHoveredCourseCell = (day: number, time: number): boolean => {
    if (!hoveredCourse) return false;
    return hoveredCourse.sessions.some(
      session => session.day === day && time >= session.startTime && time < session.endTime
    );
  };

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:۰۰`;
  };

  const ROW_HEIGHT = 52;
  const HEADER_HEIGHT = 36;
  const TIME_COL_WIDTH = 56;

  return (
    <div data-tour="schedule-grid" className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-muted/20 p-4 md:p-6">
      <div className="flex-1 overflow-auto bg-card rounded-2xl shadow-md border border-border/40">
        <div 
          className="min-w-[900px]"
          style={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(6, minmax(120px, 1fr))`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)`,
            gap: '2px',
          }}
        >
          {/* Header Row */}
          <div 
            className={cn(
              "sticky top-0 z-20 bg-muted/90 backdrop-blur-md flex items-center justify-center",
              showGridLines ? "border border-border/50" : ""
            )}
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span className={cn("font-bold text-muted-foreground text-sm", getFontSizeClass())}>ساعت</span>
          </div>

          {DAYS.map((day, dayIndex) => (
            <div
              key={`header-${day}`}
              className={cn(
                "sticky top-0 z-20 bg-muted/90 backdrop-blur-md flex items-center justify-center font-bold text-foreground text-sm",
                showGridLines ? "border-t border-b border-l border-border/50" : "",
                getFontSizeClass()
              )}
              style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {TIME_SLOTS.map((time, rowIndex) => (
            <React.Fragment key={`row-${time}`}>
              <div
                className={cn(
                  "bg-muted/40 flex items-center justify-center text-muted-foreground font-mono text-xs",
                  showGridLines ? "border-l border-b border-border/40" : "",
                  getFontSizeClass()
                )}
                style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
              >
                {formatTime(time)}
              </div>

              {DAYS.map((_, dayIndex) => {
                const sessions = getSessionsForSlot(dayIndex, time);
                const isOccupied = isCellOccupiedByPrevious(dayIndex, time);
                const isPreviewCell = isHoveredCourseCell(dayIndex, time);

                if (isOccupied) return null;

                const mainSession = sessions[0];
                const rowSpan = mainSession ? mainSession.endTime - mainSession.startTime : 1;

                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className={cn(
                      "relative transition-all duration-200",
                      showGridLines ? "border-l border-b border-border/60" : "",
                      rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                      "hover:bg-accent/30",
                      // Highlight cells where hovered course would appear
                      isPreviewCell && !mainSession && "bg-primary/15 ring-1 ring-inset ring-primary/40"
                    )}
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: rowSpan > 1 
                        ? `${rowIndex + 2} / span ${rowSpan}` 
                        : rowIndex + 2,
                    }}
                  >
                    <CourseCell sessions={sessions} />
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
