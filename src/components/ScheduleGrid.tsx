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

type SessionLayout = {
  offsetPercent: number; // 0 = no offset, 0.1 = 10% of column width
  widthPercent: number;  // 1 = full width, 0.8 = 80% of column width
};

type EnrichedSession = {
  session: ScheduledSession;
  durationMinutes: number;
};

const timeToMinutes = (t: number | string): number => {
  if (typeof t === 'number') {
    const hours = Math.floor(t);
    const minutes = Math.round((t - hours) * 60);
    return hours * 60 + minutes;
  }
  const [rawH, rawM] = t.split(':');
  const h = Number(rawH);
  const m = Number(rawM);
  const hours = Number.isFinite(h) ? h : 0;
  const minutes = Number.isFinite(m) ? m : 0;
  return hours * 60 + minutes;
};

const getSessionKey = (session: ScheduledSession): string => {
  return `${session.parentId}-${session.day}-${session.startTime}-${session.weekType}`;
};

const computeLayoutsForDay = (
  sessions: ScheduledSession[],
): Map<string, SessionLayout> => {
  const layouts = new Map<string, SessionLayout>();
  if (!sessions || sessions.length === 0) return layouts;

  // Sort by start time, then by duration (shorter first)
  const sorted = [...sessions].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    const aDur = timeToMinutes(a.endTime) - aStart;
    const bDur = timeToMinutes(b.endTime) - bStart;
    return aDur - bDur;
  });

  // Group into clusters of overlapping sessions
  const groups: ScheduledSession[][] = [];
  let currentGroup: ScheduledSession[] = [];
  let currentEnd = -Infinity;

  for (const session of sorted) {
    const start = timeToMinutes(session.startTime);
    const end = timeToMinutes(session.endTime);
    if (currentGroup.length === 0) {
      currentGroup.push(session);
      currentEnd = end;
    } else if (start < currentEnd) {
      // Overlaps with current group
      currentGroup.push(session);
      if (end > currentEnd) currentEnd = end;
    } else {
      // No overlap – start a new group
      groups.push(currentGroup);
      currentGroup = [session];
      currentEnd = end;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Assign cascading offsets within each group
  const MAX_VISIBLE_STACK = 3;
  const OFFSET_STEP = 0.09; // 9% indentation
  for (const group of groups) {
    if (group.length === 1) {
      const key = getSessionKey(group[0]);
      layouts.set(key, { offsetPercent: 0, widthPercent: 1 });
      continue;
    }

    const visibleCount = Math.min(group.length, MAX_VISIBLE_STACK);
    const baseWidth = 1 - OFFSET_STEP * (visibleCount - 1); // keep last card within column

    group.forEach((session, index) => {
      const stackIndex = Math.min(index, MAX_VISIBLE_STACK - 1);
      const offsetPercent = stackIndex * OFFSET_STEP;
      const widthPercent = baseWidth;
      const key = getSessionKey(session);
      layouts.set(key, { offsetPercent, widthPercent });
    });
  }

  return layouts;
};

/**
 * Compute how many 1-hour rows a session should span in the CSS grid.
 * Uses timeToMinutes so it works for both numeric hours (e.g. 9, 10)
 * and "HH:MM" strings (e.g. "09:00").
 */
const getRowSpanFromSession = (session: ScheduledSession): number => {
  const start = timeToMinutes(session.startTime);
  const end = timeToMinutes(session.endTime);
  const diffMinutes = Math.max(0, end - start);
  const diffHours = diffMinutes / 60;

  // Grid row span must be an integer. For our normalized data this should
  // already be a whole number, but we round defensively and never go below 1.
  const span = Math.round(diffHours || 1);
  return span > 0 ? span : 1;
};

/**
 * Enrich a list of sessions that share the same starting slot with
 * conflict-related metadata so that CourseCell can render mixed-duration
 * conflicts more intelligently.
 *
 * This function is intentionally pure and only affects presentation.
 */
const enrichSessionsWithConflictMetadata = (
  sessions: ScheduledSession[],
): ScheduledSession[] => {
  if (!sessions || sessions.length <= 1) return sessions;

  const enriched: EnrichedSession[] = sessions.map((session) => {
    const start = timeToMinutes(session.startTime);
    const end = timeToMinutes(session.endTime);
    const durationMinutes = Math.max(0, end - start);
    return {
      session,
      durationMinutes,
    };
  });

  const durations = enriched.map((s) => s.durationMinutes);
  const uniqueDurations = new Set(durations);
  const hasMixedDurations = uniqueDurations.size > 1;

  // Sort by duration so shorter sessions are visually \"on top\" in the stack.
  const sorted = [...enriched].sort(
    (a, b) => a.durationMinutes - b.durationMinutes,
  );

  return sorted.map((item, index) => ({
    ...item.session,
    conflictMetadata: {
      durationMinutes: item.durationMinutes,
      hasMixedDurationConflict: hasMixedDurations,
      // display order is only meaningful when we actually have mixed durations
      conflictDisplayOrder: hasMixedDurations ? index : undefined,
      totalConflicts: sessions.length,
    },
  }));
};

const ScheduleGrid = () => {
  const {
    scheduledSessions,
    hoveredCourseId,
    allCourses,
    hasConflict,
    selectedCourseIds,
  } = useSchedule();
  const { showGridLines, getFontSizeClass } = useSettings();
  const { isMobile, isTablet } = useResponsive();
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === 'rtl';

  // Get the hovered course for preview / highlight
  const hoveredCourse = hoveredCourseId
    ? allCourses.find(c => c.id === hoveredCourseId)
    : null;

  // If the hovered course is already part of the active schedule, we only use
  // it for highlighting existing blocks – not for ghost preview.
  const isHoveredCourseSelected =
    hoveredCourse != null && selectedCourseIds.includes(hoveredCourse.id);

  const hoveredConflict =
    hoveredCourse && !isHoveredCourseSelected ? hasConflict(hoveredCourse) : null;
  const hoveredHasConflict = hoveredConflict?.hasConflict ?? false;

  // Build synthetic ScheduledSession objects for the hovered course ONLY when
  // it is not already selected (preview from sidebar, not from the grid).
  const hoveredSessions: ScheduledSession[] = useMemo(() => {
    if (!hoveredCourse || isHoveredCourseSelected) return [];
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
  }, [hoveredCourse, isHoveredCourseSelected]);

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

  // Pre-compute horizontal layout (cascading offsets) for each day's sessions
  const layoutBySessionKey = useMemo(() => {
    const map = new Map<string, SessionLayout>();
    slotsIndex.byDay.forEach((daySessions) => {
      const dayLayouts = computeLayoutsForDay(daySessions);
      dayLayouts.forEach((layout, key) => {
        map.set(key, layout);
      });
    });
    return map;
  }, [slotsIndex]);

  const getSessionsForSlot = useCallback(
    (day: number, time: number): ScheduledSession[] => {
      const key = `${day}-${time}`;
      return slotsIndex.byDayTime.get(key) ?? [];
    },
    [slotsIndex],
  );

  /**
   * Returns true when this cell (day, time) is within the vertical span
   * of any session that started earlier on the same day – including both
   * real scheduled sessions and the hovered (ghost) course sessions.
   *
   * This prevents us from rendering extra 1-hour cells in the middle of
   * a multi-hour block, which is what was visually cutting the ghost preview
   * height in half.
   */
  const isCellOccupiedByPrevious = useCallback(
    (day: number, time: number): boolean => {
      const daySessions = slotsIndex.byDay.get(day) ?? [];
      const hoveredDaySessions = hoveredSessions.filter(
        (session) => session.day === day,
      );
      const allSessions = [...daySessions, ...hoveredDaySessions];

      const currentMinutes = timeToMinutes(time);

      return allSessions.some((session) => {
        const start = timeToMinutes(session.startTime);
        const end = timeToMinutes(session.endTime);
        return start < currentMinutes && end > currentMinutes;
      });
    },
    [slotsIndex, hoveredSessions],
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
                  "sticky z-10 bg-muted/60 backdrop-blur-sm flex items-start justify-center text-muted-foreground font-mono",
                  isMobile ? "text-[9px] pt-0.5" : "text-xs pt-1",
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
                <span>
                  {formatTime(time)}
                </span>
              </div>

              {DAYS.map((_, dayIndex) => {
                const rawSessions = getSessionsForSlot(dayIndex, time);
                const sessions = enrichSessionsWithConflictMetadata(rawSessions);
                const isPreviewCell = isHoveredCourseCell(dayIndex, time);
                const rawHoveredStartSessions = getHoveredStartSessionsForSlot(dayIndex, time);
                const hoveredStartSessions = enrichSessionsWithConflictMetadata(
                  rawHoveredStartSessions,
                );
                const cellKey = `${dayIndex}-${time}`;
                const showDiscoveryTip = firstHeavyConflictKey === cellKey;

                // Only treat the cell as occupied by a previous block if
                // there is no session starting at this time (and no preview).
                const hasStartHere =
                  sessions.length > 0 || hoveredStartSessions.length > 0;
                const isOccupied =
                  !hasStartHere && isCellOccupiedByPrevious(dayIndex, time);
                if (isOccupied) return null;

                const mainSession = sessions[0];
                const ghostMain = hoveredStartSessions[0];

                let rowSpan = 1;
                if (mainSession) {
                  rowSpan = getRowSpanFromSession(mainSession);
                } else if (ghostMain) {
                  rowSpan = getRowSpanFromSession(ghostMain);
                }

                // Cascading layout: indent overlapping sessions within a day
                let layoutStyle: React.CSSProperties | undefined;
                if (mainSession && sessions.length === 1) {
                  const layout = layoutBySessionKey.get(getSessionKey(mainSession));
                  if (layout) {
                    layoutStyle = {
                      width: `${layout.widthPercent * 100}%`,
                      ...(isRtl
                        ? { marginRight: `${layout.offsetPercent * 100}%` }
                        : { marginLeft: `${layout.offsetPercent * 100}%` }),
                    };
                  }
                }

                // When this cell is the start of a hovered (ghost) session,
                // we give the wrapper a higher z-index so the preview stack
                // stays visually above regular cells.
                const isGhostStartCell = hoveredStartSessions.length > 0 && !mainSession;

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
                    )}
                    style={{ 
                      gridColumn: dayIndex + 2, 
                      gridRow: rowSpan > 1 
                        ? `${rowIndex + 2} / span ${rowSpan}` 
                        : rowIndex + 2,
                      ...(isGhostStartCell ? { zIndex: Z_INDEX.ghostPreview } : {}),
                      ...layoutStyle,
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
