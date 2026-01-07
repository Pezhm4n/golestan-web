import React, { useMemo, useCallback, useState } from 'react';
import { DAYS, ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useResponsive } from '@/hooks/use-responsive';
import CourseCell from './CourseCell';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '@/lib/constants';

// ✅ Full possible time range (7:00 to 21:00) used as a base template
const ALL_TIME_SLOTS = Array.from({ length: 14 }, (_, i) => 7 + i);

type SessionLayout = {
  offsetPercent: number; // 0 = no offset, 0.1 = 10% of column width
  widthPercent: number;  // 1 = full width, 0.8 = 80% of column width
};

type EnrichedSession = {
  session: ScheduledSession;
  durationMinutes: number;
};

// ✅ Two groups of days for mobile view: 3 days at a time
const DAY_GROUPS = [
  { label: 'شنبه - دوشنبه', days: [0, 1, 2] },
  { label: 'سه‌شنبه - پنجشنبه', days: [3, 4, 5] },
];

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
      currentGroup.push(session);
      if (end > currentEnd) currentEnd = end;
    } else {
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

  // Sort by duration so shorter sessions are visually "on top" in the stack.
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

  // ✅ Active day group for mobile (0 => Sat-Mon, 1 => Tue-Thu)
  const [activeDayGroup, setActiveDayGroup] = useState(0);

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

  // ✅ Dynamic time slots:
  // Desktop/Tablet: show full template (7–21)
  // Mobile: only hours that actually have classes, padded by 1 hour on each side
  const timeSlots = useMemo(() => {
    if (!isMobile) {
      return ALL_TIME_SLOTS;
    }

    if (scheduledSessions.length === 0) {
      // Default university hours when there are no sessions
      return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    }

    const usedHours = new Set<number>();

    scheduledSessions.forEach(session => {
      const startHour = Math.floor(timeToMinutes(session.startTime) / 60);
      const endHour = Math.ceil(timeToMinutes(session.endTime) / 60);

      for (let h = startHour; h < endHour; h++) {
        usedHours.add(h);
      }
    });

    if (usedHours.size === 0) {
      return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    }

    const sortedHours = Array.from(usedHours).sort((a, b) => a - b);
    const minHour = Math.max(7, sortedHours[0] - 1);
    const maxHour = Math.min(20, sortedHours[sortedHours.length - 1] + 1);

    const slots: number[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      slots.push(h);
    }

    return slots;
  }, [isMobile, scheduledSessions]);

  // ✅ Visible days:
  // - Desktop/Tablet: all days
  // - Mobile: only 3-day group
  const visibleDays = useMemo(() => {
    if (!isMobile) {
      return [0, 1, 2, 3, 4, 5];
    }
    return DAY_GROUPS[activeDayGroup].days;
  }, [isMobile, activeDayGroup]);

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
    for (const time of timeSlots) {
      for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
        const key = `${dayIndex}-${time}`;
        const sessionsHere = byDayTime.get(key);
        if (sessionsHere && sessionsHere.length >= 3) {
          return key;
        }
      }
    }
    return null;
  }, [slotsIndex, timeSlots]);

  const formatTime = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Responsive sizing
  const ROW_HEIGHT = isMobile ? 52 : isTablet ? 50 : 52;
  const HEADER_HEIGHT = isMobile ? 36 : 36;
  const TIME_COL_WIDTH = isMobile ? 48 : 56;
  const MIN_COL_WIDTH = isMobile ? 100 : isTablet ? 100 : 120;

  return (
    <div
      data-tour="schedule-grid"
      className={cn(
        "relative flex-1 flex flex-col min-w-0 min-h-0 bg-muted/20",
        isMobile ? "p-2" : isTablet ? "p-3" : "p-4 md:p-6"
      )}
    >
      {/* ✅ Day group selector – only on mobile */}
      {isMobile && (
        <div className="flex items-center justify-center gap-2 mb-3 px-2">
          {DAY_GROUPS.map((group, index) => (
            <button
              key={index}
              onClick={() => setActiveDayGroup(index)}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
                activeDayGroup === index
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex-1 bg-card shadow-md border border-border/40 overflow-hidden",
          isMobile ? "rounded-xl" : "rounded-2xl"
        )}
      >
        {/* ✅ No horizontal scroll; grid always fits width */}
        <div className="w-full h-full overflow-hidden">
          <div
            id="schedule-grid-capture"
            style={{
              display: 'grid',
              gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${visibleDays.length}, minmax(${MIN_COL_WIDTH}px, 1fr))`,
              gridTemplateRows: `${HEADER_HEIGHT}px repeat(${timeSlots.length}, ${ROW_HEIGHT}px)`,
              gap: isMobile ? '1px' : '2px',
              width: '100%',
              height: '100%',
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
              <span
                className={cn(
                  "font-bold text-muted-foreground",
                  isMobile ? "text-[10px]" : "text-sm",
                  getFontSizeClass()
                )}
              >
                {t('scheduleGrid.timeHeader')}
              </span>
            </div>

            {visibleDays.map((dayIndex, colIndex) => {
              const label = t(`days.${dayIndex}`);
              return (
                <div
                  key={`header-${dayIndex}`}
                  className={cn(
                    "sticky top-0 bg-muted/95 backdrop-blur-md flex items-center justify-center font-bold text-foreground",
                    isMobile ? "text-xs" : "text-sm",
                    showGridLines &&
                      (isRtl
                        ? "border-t border-b border-r border-border/50"
                        : "border-t border-b border-l border-border/50"),
                    getFontSizeClass()
                  )}
                  style={{
                    gridColumn: colIndex + 2,
                    gridRow: 1,
                    zIndex: Z_INDEX.gridHeader,
                  }}
                >
                  {isMobile ? label.replace('\u200c', '') : label}
                </div>
              );
            })}

            {/* Time Rows */}
            {timeSlots.map((time, rowIndex) => (
              <React.Fragment key={`row-${time}`}>
                <div
                  className={cn(
                    "sticky z-10 bg-muted/60 backdrop-blur-sm flex items-start justify-center text-muted-foreground font-mono",
                    isMobile ? "text-[10px] pt-1" : "text-xs pt-1",
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
                  <span>{formatTime(time)}</span>
                </div>

                {visibleDays.map((dayIndex, colIndex) => {
                  const rawSessions = getSessionsForSlot(dayIndex, time);
                  const sessions = enrichSessionsWithConflictMetadata(rawSessions);
                  const isPreviewCell = isHoveredCourseCell(dayIndex, time);
                  const rawHoveredStartSessions = getHoveredStartSessionsForSlot(
                    dayIndex,
                    time,
                  );
                  const hoveredStartSessions = enrichSessionsWithConflictMetadata(
                    rawHoveredStartSessions,
                  );
                  const cellKey = `${dayIndex}-${time}`;
                  const showDiscoveryTip = firstHeavyConflictKey === cellKey;

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

                  const isGhostStartCell =
                    hoveredStartSessions.length > 0 && !mainSession;

                  return (
                    <div
                      key={`cell-${dayIndex}-${time}`}
                      className={cn(
                        "relative",
                        isMobile
                          ? "transition-colors duration-100"
                          : "transition-all duration-200",
                        showGridLines &&
                          (isRtl
                            ? "border-r border-b border-border/60"
                            : "border-l border-b border-border/60"),
                        rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                        isMobile ? "min-h-[52px]" : "",
                        !isMobile && "hover:bg-accent/30",
                        isPreviewCell &&
                          !mainSession &&
                          !hoveredHasConflict &&
                          "bg-primary/5"
                      )}
                      style={{
                        gridColumn: colIndex + 2,
                        gridRow:
                          rowSpan > 1
                            ? `${rowIndex + 2} / span ${rowSpan}`
                            : rowIndex + 2,
                        ...(isGhostStartCell
                          ? { zIndex: Z_INDEX.ghostPreview }
                          : {}),
                        ...layoutStyle,
                      }}
                    >
                      <CourseCell
                        sessions={sessions}
                        showConflictTip={showDiscoveryTip}
                      />
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
    </div>
  );
};

export default ScheduleGrid;
