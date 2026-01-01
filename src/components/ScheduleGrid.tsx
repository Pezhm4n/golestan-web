import React from 'react';
import { DAYS, ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import CourseCell from './CourseCell';

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i);

const ScheduleGrid = () => {
  const { scheduledSessions } = useSchedule();

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

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:۰۰`;
  };

  const ROW_HEIGHT = 60;
  const HEADER_HEIGHT = 40;
  const TIME_COL_WIDTH = 60;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div 
          className="min-w-[800px]"
          style={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(6, minmax(0, 1fr))`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          {/* Header Row */}
          <div 
            className="sticky top-0 z-20 bg-muted border border-border flex items-center justify-center"
            style={{ gridColumn: 1, gridRow: 1 }}
          >
            <span className="text-[10px] font-bold text-muted-foreground">ساعت</span>
          </div>

          {DAYS.map((day, dayIndex) => (
            <div
              key={`header-${day}`}
              className="sticky top-0 z-20 bg-muted border-t border-b border-l border-border flex items-center justify-center font-bold text-[11px] text-foreground"
              style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
            >
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {TIME_SLOTS.map((time, rowIndex) => (
            <React.Fragment key={`row-${time}`}>
              <div
                className="bg-muted/70 border-l border-b border-border flex items-center justify-center text-[10px] text-muted-foreground font-mono"
                style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
              >
                {formatTime(time)}
              </div>

              {DAYS.map((_, dayIndex) => {
                const sessions = getSessionsForSlot(dayIndex, time);
                const isOccupied = isCellOccupiedByPrevious(dayIndex, time);

                if (isOccupied) return null;

                const mainSession = sessions[0];
                const rowSpan = mainSession ? mainSession.endTime - mainSession.startTime : 1;

                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className={`
                      relative border-l border-b border-border
                      ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/10'}
                      hover:bg-accent/20 transition-colors
                    `}
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