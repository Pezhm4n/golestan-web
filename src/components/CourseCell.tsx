import React, { useState, useRef } from 'react';
import { X, AlertTriangle, Pencil, MousePointer2, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CourseGroup, ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getCourseColor, GROUP_LABELS } from '@/hooks/useCourseColors';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EllipsisText } from '@/components/ui/ellipsis-text';
import { cn } from '@/lib/utils';
import { Z_INDEX } from '@/lib/constants';

interface CourseCellProps {
  sessions?: ScheduledSession[];
  ghost?: boolean;
  /** When true, render this cell as a red conflict preview overlay */
  conflictPreview?: boolean;
  /** Whether this cell is chosen to show the smart discovery tip (only first heavy conflict). */
  showConflictTip?: boolean;
}

// Helper to generate a deterministic course color based on group/type and id.
const generateCourseColor = (group: CourseGroup, id: string): string => {
  return getCourseColor(id, group);
};

interface SingleBlockProps {
  session: ScheduledSession;
  isHalf?: boolean;
  isStacked?: boolean;
  stackIndex?: number;
  totalStacked?: number;
  position?: 'top' | 'bottom';
  ghost?: boolean;
  conflictPreview?: boolean;
  onEdit?: (session: ScheduledSession) => void;
  /** When true, this block is the active member of a stacked conflict cycle */
  isActiveStack?: boolean;
  /** True when any member of this stacked group is currently active (cycled). */
  hasActiveStack?: boolean;
  /** Optional handler to cycle stacked conflicts on double click */
  onStackDoubleClick?: (stackIndex: number) => void;
}

const adjustCourseColorForHover = (color: string, amount = 0.2): string => {
  // Expecting colors in the form: hsl(h s% l%)
  const match = color.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/);
  if (!match) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('Invalid course color format for hover adjustment:', color);
    }
    return color;
  }

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const l = parseFloat(match[3]);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  // Slightly increase saturation and reduce lightness to make the color
  // feel bolder without drifting too far from the original tone.
  const newS = clamp(s * (1 + amount * 0.5), 0, 100);
  const newL = clamp(l * (1 - amount), 0, 100);

  return `hsl(${h} ${newS}% ${newL}%)`;
};

const SingleBlock = ({
  session,
  isHalf = false,
  isStacked = false,
  stackIndex = 0,
  totalStacked = 1,
  position,
  ghost = false,
  conflictPreview = false,
  onEdit,
  isActiveStack = false,
  hasActiveStack = false,
  onStackDoubleClick,
}: SingleBlockProps) => {
  const {
    hoveredCourseId,
    setHoveredCourseId,
    removeCourse,
  } = useSchedule();
  const { fontSize } = useSettings();
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  const baseColor = generateCourseColor(session.group, session.parentId);
  // Always use the course color as the base background to preserve identity.
  // If for any reason the color generator returns an invalid value, fall back
  // to a very light gray so cards never appear as "white holes".
  const effectiveBackgroundColor =
    baseColor && baseColor.trim() !== '' ? baseColor : 'hsl(210 40% 96%)';

  // Track last tap time for mobile double‑tap detection (per card)
  const lastTapRef = useRef<number>(0);

  // Globally highlighted: every session of this course across the grid.
  const isGloballyHighlighted = hoveredCourseId === session.parentId;

  // Pop-out rules:
  // - Stacked:
  //   - Active member (cycled) always pops out.
  //   - Hovered card pops out while the mouse is over it.
  //   - Any session of a globally highlighted course (hovered anywhere)
  //     also pops out so all its blocks expand to full cells.
  // - Non-stacked:
  //   - Pop out when either globally highlighted or locally hovered.
  const isPopout = isStacked
    ? isActiveStack || isHovered || isGloballyHighlighted
    : (isGloballyHighlighted || isHovered);

  const isHighlighted = isGloballyHighlighted || isPopout;

  const backgroundColor = isHighlighted
    ? adjustCourseColorForHover(effectiveBackgroundColor, 0.2)
    : effectiveBackgroundColor;

  const weekLabel =
    session.weekType === 'odd'
      ? t('course.weekType.odd')
      : session.weekType === 'even'
      ? t('course.weekType.even')
      : null;

  // Custom courses are identified by their id prefix generated in AddCourseDialog
  const isCustomCourse = session.parentId.startsWith('custom_');

  const groupNumberLabel =
    typeof session.groupNumber === 'number'
      ? session.groupNumber.toString().padStart(2, '0')
      : null;

  const courseCodeWithGroup = groupNumberLabel
    ? `${session.courseId}_${groupNumberLabel}`
    : session.courseId;

  // ---- Duration helpers ------------------------------------
  const parseTime = (t: string | number): number => {
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

  // Duration in minutes between start and end (calculated once)
  const durationMinutes =
    parseTime(session.endTime) - parseTime(session.startTime);

  // Compact rule: only treat exactly 60‑minute sessions as compact
  const isOneHourSession = durationMinutes === 60;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCourse(session.parentId);
  };

  const conflictMeta = session.conflictMetadata;

  // Stacked card layout for conflicting sessions -------------------------
  const STACK_OFFSET_PX = 10;

  // If conflict metadata is available, we use its display order as the
  // primary stacking index so shorter sessions appear visually distinct.
  const stackOrderIndex =
    isStacked &&
    conflictMeta &&
    conflictMeta.hasMixedDurationConflict &&
    typeof conflictMeta.conflictDisplayOrder === 'number'
      ? conflictMeta.conflictDisplayOrder
      : stackIndex;

  const baseStackOffset = isStacked ? stackOrderIndex * STACK_OFFSET_PX : 0;

  // Z‑index ladder (kept intentionally low to stay under global dialogs):
  //  - normal cards: 1
  //  - stacked cards: 5..(5 + n)
  //  - globally highlighted cards: ~10
  //  - conflict preview overlays: ~15
  //  - pop‑out / active stacked card in a cell: 50
  //  - conflict badge inside the cell: 22
  const baseStyle: React.CSSProperties = {
    backgroundColor,
    zIndex: isStacked ? 5 + stackOrderIndex : 1,
  };

  if (isStacked) {
    // Default stacked positioning: slightly offset so all conflicts are visible.
    baseStyle.left = `${baseStackOffset}px`;
    baseStyle.top = `${baseStackOffset}px`;

    if (conflictMeta?.hasMixedDurationConflict) {
      const totalConflicts = conflictMeta.totalConflicts ?? totalStacked;
      const maxOffset = Math.max(totalConflicts - 1, 0) * STACK_OFFSET_PX;

      if (isPopout) {
        // When popped out (hovered or active in cycle), cover the whole cell.
        baseStyle.left = '0px';
        baseStyle.top = '0px';
        baseStyle.width = '100%';
        baseStyle.height = '100%';
      } else {
        // In stacked view, shorter sessions are slightly smaller so the
        // longer ones remain visible underneath.
        const widthReduction = maxOffset + 8;
        const heightReduction = baseStackOffset;

        baseStyle.width = `calc(100% - ${widthReduction}px)`;
        baseStyle.height = `calc(100% - ${heightReduction}px)`;
      }
    } else {
      const inactiveWidth = 'calc(100% - 16px)';
      const inactiveHeight = `calc(100% - ${baseStackOffset}px)`;

      // Popout / active item: expand to cover the whole cell.
      if (isPopout) {
        baseStyle.left = '0px';
        baseStyle.top = '0px';
        baseStyle.width = '100%';
        baseStyle.height = '100%';
      } else {
        baseStyle.width = inactiveWidth;
        baseStyle.height = inactiveHeight;
      }
    }
  } else {
    baseStyle.width = '100%';
    baseStyle.height = '100%';
  }

  // Pop‑out / active stacked card: should dominate within this cell,
  // اما همچنان زیر دیالوگ‌های سراسری بماند.
  if (isPopout) {
    baseStyle.zIndex = 50;
  } else if (isGloballyHighlighted) {
    // Highlight from elsewhere (e.g. sidebar) بدون پاپ‌اوت کامل.
    baseStyle.zIndex = Math.max(baseStyle.zIndex ?? 0, isStacked ? 10 : 8);
  }

  // Conflict preview overlay: بالاتر از کارت‌های عادی، پایین‌تر از پاپ‌اوت
  if (conflictPreview) {
    baseStyle.zIndex = Math.max(baseStyle.zIndex ?? 0, 15);
  }

  // Ghost / preview card: همیشه بالاتر از کارت‌های واقعی و Badgeهای تداخل.
  if (ghost) {
    baseStyle.zIndex = Z_INDEX.ghostPreview;
  }

  const handleStackFlip = () => {
    // فقط در حالت تداخل واقعی روی کارت‌های اصلی چرخه انجام شود
    if (!isStacked || ghost) return;
    // با دابل‌کلیک/دابل‌تپ، هاور را ریست می‌کنیم تا فقط عضو activeStack پاپ‌اوت بماند
    setHoveredCourseId(null);
    setIsHovered(false);
    if (typeof stackIndex === 'number') {
      onStackDoubleClick?.(stackIndex);
    }
  };

  // Double‑tap detection for touch devices (only meaningful for stacked conflicts).
  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;

    if (tapLength < 300 && tapLength > 0) {
      // Double Tap detected
      e.preventDefault(); // Prevent zoom
      e.stopPropagation();
      handleStackFlip();
    }

    lastTapRef.current = currentTime;
  };

  const card = (
    <div
      data-export-course-card
      className={cn(
        'group relative flex flex-col items-center justify-center text-center cursor-pointer',
        'rounded-lg border border-gray-900/20',
        // Ensure the card can visually pop outside the slot when zoomed,
        // while the parent cell controls clipping.
        'max-w-full min-w-0 w-full h-full overflow-visible',
        // Smooth transition for all interactive states.
        'transition-all duration-300 ease-out',
        // Base shadow so the card feels tactile.
        'shadow-sm',
        // Vertical split support (kept for future use).
        isHalf ? 'h-1/2' : 'h-full',
        isHalf && position === 'top' && 'border-b border-dashed border-gray-500/40',
        // Stacked conflict cards are absolutely positioned inside the cell.
        isStacked && 'absolute',
        // Conflict preview styling: keep the course color but add a red emphasis frame.
        conflictPreview && 'border-red-600 ring-2 ring-red-500/80',
        // Premium hover interaction:
        !ghost && [
          'hover:scale-[1.05] hover:shadow-2xl',
          'hover:ring-4 hover:ring-white/95',
        ],
        // All highlighted sessions of this course
        isHighlighted && 'shadow-md ring-2 ring-white/70',
        // The exact block that is popped out (hovered or active in cycle)
        isPopout && [
          'scale-[1.05]',
          'shadow-2xl',
          'ring-4',
          'ring-white/95',
        ],
        // Subtle press feedback, بدون دیم کردن بقیه کارت‌ها.
        'active:scale-[1.02]',
        // Responsive padding
        'p-1.5 sm:p-2 md:p-2.5',
      )}
      style={baseStyle}
      onMouseEnter={() => {
        setHoveredCourseId(session.parentId);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setHoveredCourseId(null);
        setIsHovered(false);
      }}
      onDoubleClick={isStacked ? (e) => {
        e.stopPropagation();
        handleStackFlip();
      } : undefined}
      onTouchEnd={isStacked ? handleTouchEnd : undefined}
    >
      {/* Edit / Delete Buttons - larger touch target on mobile */}
      {!ghost && (
        <div
          className={cn(
            'absolute z-30 flex items-center gap-1',
            'top-1 right-1 opacity-100 sm:top-2 sm:right-2 sm:opacity-0 sm:group-hover:opacity-100',
            'transition-opacity duration-150',
          )}
        >
          {isCustomCourse && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(session);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/90 text-white shadow-sm transition-colors hover:bg-amber-600 sm:h-5 sm:w-5"
            >
              <Pencil className="h-3 w-3 sm:h-3 sm:w-3" />
            </button>
          )}
          <button
            onClick={handleRemove}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/90 text-white shadow-sm transition-colors hover:bg-red-600 sm:h-5 sm:w-5"
          >
            <X className="w-3 h-3 sm:w-3 sm:h-3" />
          </button>
        </div>
      )}

      {/* Week Type Badge */}
      {weekLabel && (
        <span
          className={cn(
            'absolute top-1 left-1 text-[8px] px-1.5 py-0.5 font-bold rounded-md shadow-sm',
            session.weekType === 'odd'
              ? 'bg-amber-400/95 text-amber-900'
              : 'bg-sky-400/95 text-sky-900',
          )}
        >
          {weekLabel}
        </span>
      )}

      {/* Content - Centered Layout with responsive text */}
      <div className="flex flex-col items-center justify-center w-full h-full max-w-full min-w-0 textcenter gap-0.5 overflow-hidden">
        {/* Title - Truncated to prevent overflow */}
        <h3
          className={cn(
            'font-bold text-gray-900 leading-tight w-full max-w-full min-w-0 overflow-hidden',
            isHalf
              ? 'text-[11px]'
              : fontSize === 'small'
              ? 'text-xs'
              : fontSize === 'large'
              ? 'text-sm'
              : 'text-sm',
          )}
        >
          <EllipsisText className="block w-full" dir="rtl">
            {session.courseName}
          </EllipsisText>
        </h3>

        {/* Indicator for mixed-duration conflicts */}
        {conflictMeta?.hasMixedDurationConflict && !isPopout && (
          <div className="relative w-full flex justify-center">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-amber-500/90 text-white px-1.5 py-0.5 rounded-full text-[7px] font-bold shadow-sm pointer-events-none">
              <AlertTriangle className="w-2 h-2" />
              {conflictMeta.durationMinutes}
              {t('labels.minutes', { defaultValue: 'دقیقه' })}
            </div>
          </div>
        )}

        {/* Metadata block is always rendered so it can appear in exports.
            For compact (1-hour) sessions we hide it in the UI but reveal it
            when the ancestor has the `.export-mode` class (export-only mode). */}
        <div
          className={cn(
            'flex flex-col gap-0.5 w-full',
            isOneHourSession ? 'hidden group-[.export-mode]:flex' : 'flex',
          )}
        >
          {/* Course code + group row (combined) */}
          <div className="flex items-center justify-center w-full max-w-full min-w-0 gap-1 text-[11px] font-bold text-gray-800 overflow-hidden">
            <EllipsisText
              className="inline-block min-w-0 max-w-full font-mono tracking-tight"
              dir="ltr"
            >
              {courseCodeWithGroup}
            </EllipsisText>
          </div>

          {/* Subtitle - Instructor */}
          {!isHalf && (
            <p
              className={cn(
                'text-gray-700 w-full max-w-full min-w-0 overflow-hidden',
                fontSize === 'small'
                  ? 'text-[11px]'
                  : fontSize === 'large'
                  ? 'text-xs'
                  : 'text-xs',
              )}
            >
              <EllipsisText className="block w-full" dir="rtl">
                {session.instructor}
              </EllipsisText>
            </p>
          )}

          {/* Metadata Row - Credits */}
          <div className="flex items-center justify-center gap-1 max-w-full overflow-hidden">
            <span
              className={cn(
                'bg-gray-800/15 text-gray-800 px-1 py-0.5 rounded font-semibold whitespace-nowrap',
                isHalf
                  ? 'text-[6px]'
                  : fontSize === 'small'
                  ? 'text-[7px]'
                  : fontSize === 'large'
                  ? 'text-[10px]'
                  : 'text-[8px]',
              )}
            >
              {session.credits} {t('labels.units')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // For stacked conflict cards, we do NOT wrap in a Popover.
  // This ensures double‑click with mouse always works (no overlay intercept).
  if (isStacked) {
    return card;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {card}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="max-w-xs p-2"
        sideOffset={8}
        style={{ zIndex: Z_INDEX.popover }}
      >
        <div className="space-y-1 text-[11px]">
          <h4 className="font-bold text-sm">
            {session.courseName}{' '}
            <span
              className="font-mono text-[11px] text-muted-foreground"
              dir="ltr"
            >
              ({courseCodeWithGroup})
            </span>
          </h4>
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
            <span className="text-muted-foreground">{t('course.labels.instructor')}</span>
            <span>{session.instructor}</span>
            <span className="text-muted-foreground">{t('course.labels.location')}</span>
            <span>{session.location}</span>
            <span className="text-muted-foreground">{t('course.labels.units')}</span>
            <span>{session.credits}</span>
            <span className="text-muted-foreground">{t('course.labels.type')}</span>
            <span>{GROUP_LABELS[session.group]}</span>
            {session.examDate && (
              <>
                <span className="text-muted-foreground">{t('course.labels.exam')}</span>
                <span>
                  {session.examDate} - {session.examTime}
                </span>
              </>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p className="leading-relaxed text-foreground/90 max-h-20 overflow-y-auto">
                {session.description && session.description.toString().trim() !== ''
                  ? session.description
                  : '---'}
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const CourseCell = ({
  sessions = [],
  ghost = false,
  conflictPreview = false,
  showConflictTip = false,
}: CourseCellProps) => {
  const { t } = useTranslation();
  const { selectedCourses, setEditingCourse } = useSchedule();
  const { hasSeenConflictTip, markConflictTipAsSeen } = useSettings();
  // Index of the currently active item in a stacked conflict cycle (per cell)
  const [activeStackIndex, setActiveStackIndex] = useState<number | null>(null);

  if (!sessions || sessions.length === 0) return null;

  // Check for odd/even week split (2 sessions with different week types)
  const hasDualWeek =
    sessions.length === 2 &&
    sessions[0].weekType !== 'both' &&
    sessions[1].weekType !== 'both' &&
    sessions[0].weekType !== sessions[1].weekType;

  // True conflict: more than 2 sessions, or 2+ sessions with same week type
  const hasConflict = sessions.length > 1 && !hasDualWeek;
  const hasHeavyConflict = hasConflict && sessions.length >= 3;

  // Handle double-click cycling within a stacked conflict cell
  const handleStackDoubleClick = (currentStackIndex: number) => {
    if (!hasConflict || sessions.length <= 1) return;

    // اولین باری که کاربر واقعاً دابل‌کلیک می‌کند، نکته را دیده تلقی می‌کنیم
    if (!hasSeenConflictTip) {
      markConflictTipAsSeen();
    }

    // همیشه از اندیسی که روی آن دابل‌کلیک شده شروع کن
    // و به آیتم بعدی در آرایه برو (با حلقه‌ی بی‌نهایت).
    const nextIndex = (currentStackIndex + 1) % sessions.length;
    setActiveStackIndex(nextIndex);
  };

  // Stacked conflict view - show all courses layered
  if (hasConflict) {
    const shouldShowConflictTip =
      hasHeavyConflict && !ghost && !conflictPreview && !hasSeenConflictTip;

    return (
      <div
        className={cn(
          // Parent container intentionally has NO visible styling:
          // no border, no background, no radius – only positioning.
          'absolute inset-0',
          ghost && 'pointer-events-none',
        )}
        style={ghost ? { zIndex: Z_INDEX.ghostPreview } : undefined}
        onMouseLeave={() => setActiveStackIndex(null)}
      >
        {/* Conflict indicator badge - روی کارت‌های این سلول، ولی زیر دیالوگ‌های سراسری */}
        <div
          className="absolute top-0 left-0 pointer-events-none flex items-center gap-0.5 bg-destructive text-destructive-foreground px-1 py-0.5 rounded text-[8px] font-bold shadow-md"
          style={{ zIndex: Z_INDEX.conflictBadge }}
        >
          <AlertTriangle className="w-2.5 h-2.5" />
          {t('course.conflictIndicator', { count: sessions.length })}
        </div>

        {/* One-time discovery tip for heavy conflicts (3+ courses) */}
        {shouldShowConflictTip && (
          <div
            className="pointer-events-none absolute -top-2 right-2 -translate-y-full w-60 rounded-xl border bg-sky-600/95 text-white shadow-2xl px-3 py-2 flex items-start gap-2"
            style={{ zIndex: Z_INDEX.discoveryTip, borderColor: '#e0f2fe' }}
          >
            <div className="mt-0.5 shrink-0 pointer-events-auto">
              <MousePointer2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-[11px] leading-snug pointer-events-auto" dir="rtl">
              <p>{t('course.conflictTip')}</p>
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    markConflictTipAsSeen();
                  }}
                  className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold hover:bg-white/25 transition-colors pointer-events-auto"
                >
                  {t('course.conflictTipGotIt')}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                markConflictTipAsSeen();
              }}
              className="mt-0.5 ml-1 text-white/70 hover:text-white transition-colors pointer-events-auto"
              aria-label="dismiss conflict tip"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Stacked courses */}
        <div className="relative w-full h-full">
          {sessions.map((session, index) => (
            <SingleBlock
              key={`${session.parentId}-${session.day}-${session.startTime}-${session.weekType}-${index}`}
              session={session}
              isStacked
              stackIndex={index}
              totalStacked={sessions.length}
              ghost={ghost}
              conflictPreview={conflictPreview}
              isActiveStack={
                activeStackIndex !== null ? index === activeStackIndex : false
              }
              hasActiveStack={activeStackIndex !== null}
              onStackDoubleClick={(stackIndex) =>
                handleStackDoubleClick(stackIndex)
              }
            />
          ))}
        </div>
      </div>
    );
  }

  // Handler passed down to SingleBlock for editing custom courses
  const handleEdit = (session: ScheduledSession) => {
    const course = selectedCourses.find(c => c.id === session.parentId);
    if (!course) return;
    setEditingCourse(course);
  };

  // Dual week view (odd/even) – render side-by-side in the same time block
  if (hasDualWeek) {
    const oddSession = sessions.find(s => s.weekType === 'odd') || sessions[0];
    const evenSession = sessions.find(s => s.weekType === 'even') || sessions[1];

    return (
      <div
        className={cn(
          // Parent container must remain visually invisible here as well:
          // no border, no background – only positioning.
          'absolute inset-0',
          ghost && 'pointer-events-none',
        )}
        style={ghost ? { zIndex: Z_INDEX.ghostPreview } : undefined}
      >
        <div className="relative flex w-full h-full gap-1">
          <div className="relative w-1/2 h-full">
            <SingleBlock
              session={oddSession}
              ghost={ghost}
              conflictPreview={conflictPreview}
              onEdit={handleEdit}
            />
          </div>
          <div className="relative w-1/2 h-full">
            <SingleBlock
              session={evenSession}
              ghost={ghost}
              conflictPreview={conflictPreview}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
    );
  }

  // Single course
  return (
    <div
      className={cn(
        'absolute inset-[1px] rounded-sm overflow-hidden',
        ghost && 'pointer-events-none',
      )}
      style={ghost ? { zIndex: Z_INDEX.ghostPreview } : undefined}
    >
      <SingleBlock
        session={sessions[0]}
        ghost={ghost}
        conflictPreview={conflictPreview}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default CourseCell;
