import React, { useMemo, useCallback } from 'react';
import { DAYS, ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useResponsive } from '@/hooks/use-responsive';
import CourseCell from './CourseCell';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '@/lib/constants';

const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i);

const ScheduleGrid = () => {
  const { scheduledSessions, hoveredCourseId, allCourses, hasConflict } = useSchedule();
  const { showGridLines, getFontSizeClass } = useSettings();
  const { isMobile, isTablet } = useResponsive();
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === 'rtl';

  // Get the hovered course for preview
  const hoveredCourse = hoveredCourseId 
    ? allCourses.find(c => c.id === hoveredCourseId) 
    : null;

  const hoveredConflict = hoveredCourse ? hasConflict(hoveredCourse) : null;
  const hoveredHasConflict = hoveredConflict?.hasConflict ?? false;

  // Build synthetic ScheduledSession objects for the hovered course
  const hoveredSessions: ScheduledSession[] = useMemo(() => {
    if (!hoveredCourse) return [];
    return hoveredCourse.sessions.map((session) => ({
      ...session,
      courseId: hoveredCourse.courseId,
      parentId: hoveredCourse.id,
      courseName: hoveredCourse.name,
      instructor: hoveredCourse.instructor,
      credits: hoveredCourse.credits,
      group: hoveredCourse.group,
      groupNumber: hoveredCourse.groupNumber,
      examDate: hoveredCourse.examDate,
      examTime: hoveredCourse.examTime,
    }));
  }, [hoveredCourse]);

  // Pre-index scheduled sessions for efficient lookups
  const slotsIndex = useMemo(() => {
    const byDayTime = new Map<string, ScheduledSession[]>();
    const byDay = new Map<number, ScheduledSession[]>();

    for (const session of scheduledSessions) {
      const key = `${session.day}-${session.startTime}`;
      const list = byDayTime.get(key);
      if (list) {
        list.push(session);
      } else {
        byDayTime.set(key, [session]);
      }

      const dayList = byDay.get(session.day);
      if (dayList) {
        dayList.push(session);
      } else {
        byDay.set(session.day, [session]);
      }
    }

    return { byDayTime, byDay };
  }, [scheduledSessions]);

  const getSessionsForSlot = useCallback(
    (day: number, time: number): ScheduledSession[] => {
      const key = `${day}-${time}`;
      return slotsIndex.byDayTime.get(key) ?? [];
    },
    [slotsIndex],
  );

  const isCellOccupiedByPrevious = useCallback(
    (day: number, time: number): boolean => {
      const daySessions = slotsIndex.byDay.get(day) ?? [];
      return daySessions.some(
        session =>
          Number(session.startTime) < time && Number(session.endTime) > time,
      );
    },
    [slotsIndex],
  );

  const getHoveredStartSessionsForSlot = useCallback(
    (day: number, time: number): ScheduledSession[] => {
      return hoveredSessions.filter(
        session => session.day === day && Number(session.startTime) === time,
      );
    },
    [hoveredSessions],
  );

  // Check if this cell would be occupied by the hovered course (any part of its duration)
  const isHoveredCourseCell = useCallback(
    (day: number, time: number): boolean => {
      return hoveredSessions.some(
        session =>
          session.day === day &&
          time >= Number(session.startTime) &&
          time < Number(session.endTime),
      );
    },
    [hoveredSessions],
  );

  // Find the first heavy conflict cell (3+ sessions starting at same slot)
  const firstHeavyConflictKey = useMemo(() => {
    const { byDayTime } = slotsIndex;
    for (const time of TIME_SLOTS) {
      for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
        const key = `${dayIndex}-${time}`;
        const sessionsHere = byDayTime.get(key);
        if (sessionsHere && sessionsHere.length >= 3) {
          return key;
        }
      }
    }
    return null;
  }, [slotsIndex]);

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Responsive sizing
  const ROW_HEIGHT = isMobile ? 48 : isTablet ? 50 : 52;
  const HEADER_HEIGHT = isMobile ? 32 : 36;
  const TIME_COL_WIDTH = isMobile ? 44 : 56;
  const MIN_COL_WIDTH = isMobile ? 90 : isTablet ? 100 : 120;

  return (
    <div 
      data-tour="schedule-grid" 
      className={cn(
        "flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-muted/20",
        isMobile ? "p-2" : isTablet ? "p-3" : "p-4 md:p-6"
      )}
    >
      {/* Scroll hint for mobile */}
      {isMobile && (
        <div className="flex items-center justify-center gap-2 py-1.5 text-[10px] text-muted-foreground">
          <span>{t('scheduleGrid.scrollHint')}</span>
        </div>
      )}
      
      <div 
        className={cn(
          "flex-1 overflow-auto bg-card shadow-md border border-border/40",
          isMobile ? "rounded-xl" : "rounded-2xl",
          // Smooth scrolling for touch
          "scroll-smooth touch-pan-x touch-pan-y"
        )}
        style={{
          // Prevent overscroll bounce on iOS
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div 
          id="schedule-grid-capture"
          style={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(6, minmax(${MIN_COL_WIDTH}px, 1fr))`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)`,
            gap: isMobile ? '1px' : '2px',
            minWidth: `${TIME_COL_WIDTH + (MIN_COL_WIDTH * 6) + 12}px`,
          }}
        >
          {/* Header Row */}
          <div 
            className={cn(
              "sticky top-0 bg-muted/95 backdrop-blur-md flex items-center justify-center",
              showGridLines ? "border border-border/50" : ""
            )}
            style={{
              gridColumn: 1,
              gridRow: 1,
              zIndex: Z_INDEX.gridHeader,
              ...(isRtl ? { right: 0 } : { left: 0 }),
            }}
          >
            <span className={cn(
              "font-bold text-muted-foreground",
              isMobile ? "text-[10px]" : "text-sm",
              getFontSizeClass()
            )}>
              {t('scheduleGrid.timeHeader')}
            </span>
          </div>

          {DAYS.map((_, dayIndex) => {
            const label = t(`days.${dayIndex}`);
            return (
              <div
                key={`header-${dayIndex}`}
                className={cn(
                  "sticky top-0 bg-muted/95 backdrop-blur-md flex items-center justify-center font-bold text-foreground",
                  isMobile ? "text-[11px]" : "text-sm",
                  showGridLines &&
                    (isRtl
                      ? "border-t border-b border-r border-border/50"
                      : "border-t border-b border-l border-border/50"),
                  getFontSizeClass()
                )}
                style={{ gridColumn: dayIndex + 2, gridRow: 1, zIndex: Z_INDEX.gridHeader }}
              >
                {isMobile ? label.replace('\u200c', '') : label}
              </div>
            );
          })}

          {/* Time Rows */}
          {TIME_SLOTS.map((time, rowIndex) => (
            <React.Fragment key={`row-${time}`}>
              <div
                className={cn(
                  "sticky z-10 bg-muted/60 backdrop-blur-sm flex items-end justify-center text-muted-foreground font-mono",
                  isMobile ? "text-[9px]" : "text-xs",
                  showGridLines &&
                    (isRtl
                      ? "border-r border-b border-border/40"
                      : "border-l border-b border-border/40"),
                  getFontSizeClass()
                )}
                style={{
                  gridColumn: 1,
                  gridRow: rowIndex + 2,
                  ...(isRtl ? { right: 0 } : { left: 0 }),
                }}
              >
                <span className="translate-y-1/2">
                  {formatTime(time)}
                </span>
              </div>

              {DAYS.map((_, dayIndex) => {
                const sessions = getSessionsForSlot(dayIndex, time);
                const isOccupied = isCellOccupiedByPrevious(dayIndex, time);
                const isPreviewCell = isHoveredCourseCell(dayIndex, time);
                const hoveredStartSessions = getHoveredStartSessionsForSlot(dayIndex, time);
                const cellKey = `${dayIndex}-${time}`;
                const showDiscoveryTip = firstHeavyConflictKey === cellKey;

                if (isOccupied) return null;

                const mainSession = sessions[0];
                const ghostMain = hoveredStartSessions[0];

                const rowSpan = mainSession
                  ? mainSession.endTime - mainSession.startTime
                  : ghostMain
                    ? ghostMain.endTime - ghostMain.startTime
                    : 1;

                return (
                  <div
                    key={`cell-${dayIndex}-${time}`}
                    className={cn(
                      "relative",
                      // Reduce animation on mobile for performance
                      isMobile ? "transition-colors duration-100" : "transition-all duration-200",
                      showGridLines &&
                        (isRtl
                          ? "border-r border-b border-border/60"
                          : "border-l border-b border-border/60"),
                      rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                      // Larger touch target on mobile
                      isMobile ? "min-h-[48px]" : "",
                      // Highlight on hover (desktop only)
                      !isMobile && "hover:bg-accent/30",
                      // Active state for touch
                      "active:bg-accent/40",
                      // Highlight cells where hovered course would appear (non-conflict preview)
                      isPreviewCell && !mainSession && !hoveredHasConflict && "bg-primary/5"
                    )
                    }
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: rowSpan > 1 
                        ? `${rowIndex + 2} / span ${rowSpan}` 
                        : rowIndex + 2,
                    }}
                  >
                    <CourseCell sessions={sessions} showConflictTip={showDiscoveryTip} />
                    {hoveredStartSessions.length > 0 && (
                      <CourseCell
                        sessions={hoveredStartSessions}
                        ghost
                        conflictPreview={hoveredHasConflict}
                        showConflictTip={false}
                      />
                    )}
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
