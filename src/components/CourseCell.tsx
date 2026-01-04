import { useState } from 'react';
import { X, AlertTriangle, Pencil } from 'lucide-react';
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

interface CourseCellProps {
  sessions?: ScheduledSession[];
  ghost?: boolean;
  /** When true, render this cell as a red conflict preview overlay */
  conflictPreview?: boolean;
}

// Helper to generate a deterministic course color based on group/type and id.
// Delegates to getCourseColor so the palette stays consistent across the app.
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
}

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
}: SingleBlockProps) => {
  const {
    hoveredCourseId,
    setHoveredCourseId,
    removeCourse,
  } = useSchedule();
  const { getFontSizeClass, fontSize } = useSettings();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const baseColor = generateCourseColor(session.group, session.parentId);
  // Always use the course color as the base background to preserve identity.
  const effectiveBackgroundColor = baseColor;

  const isHighlighted = hoveredCourseId === session.parentId;
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
  // Times may be stored as numbers (hour, possibly fractional)
  // or as "HH:MM" strings. This helper supports both.
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
    parseTime(session.endTime as any) - parseTime(session.startTime as any);

  // Compact rule: only treat exactly 60‑minute sessions as compact
  const isOneHourSession = durationMinutes === 60;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCourse(session.parentId);
  };

  // Stacked card layout for conflicting sessions -------------------------
  // Simple horizontal/vertical offset so cards overlap slightly.
  const STACK_OFFSET_PX = 10;

  const baseStackOffset = isStacked ? stackIndex * STACK_OFFSET_PX : 0;
  const stackWidth = isStacked ? 'calc(100% - 16px)' : '100%';

  const baseStyle: React.CSSProperties = {
    backgroundColor: effectiveBackgroundColor,
    zIndex: isStacked ? 10 + stackIndex : 1,
  };

  if (isStacked) {
    baseStyle.left = `${baseStackOffset}px`;
    baseStyle.top = `${baseStackOffset}px`;
    baseStyle.width = stackWidth;
    baseStyle.height = `calc(100% - ${baseStackOffset}px)`;
  }

  if (isHighlighted) {
    baseStyle.zIndex = 30;
  }

  if (conflictPreview) {
    baseStyle.zIndex = Math.max(baseStyle.zIndex ?? 0, 20);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'group relative flex flex-col justify-center items-center text-center overflow-hidden cursor-pointer',
            'border-r-[3px] border-r-gray-700/50 rounded-lg',
            // Ensure content never exceeds cell bounds
            'max-w-full min-w-0',
            // Conflict preview styling: keep course color, add red border/ring
            conflictPreview && 'border-red-600 ring-2 ring-red-500/80',
            // Unified, subtle hover
            'transition-all duration-200 ease-out',
            'hover:shadow-lg hover:brightness-[1.05]',
            isHalf ? 'h-1/2' : 'h-full',
            isHalf && position === 'top' ? 'border-b border-dashed border-gray-500/40' : '',
            // Hover / highlight effect: slight ring/shadow without layout shift
            isHighlighted && 'shadow-lg ring-2 ring-white/60',
            // Responsive padding
            'p-1.5 sm:p-2 md:p-2.5',
            // Stacked cards get absolute positioning and subtle border/shadow
            isStacked && 'absolute shadow-sm border border-gray-600/40',
            // Touch feedback
            'active:scale-[0.98]',
          )}
          style={baseStyle}
          onMouseEnter={() => setHoveredCourseId(session.parentId)}
          onMouseLeave={() => setHoveredCourseId(null)}
          onTouchStart={() => setHoveredCourseId(session.parentId)}
          onTouchEnd={() => setHoveredCourseId(null)}
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
          <div className="flex flex-col items-center justify-center w-full h-full max-w-full min-w-0 text-center gap-0.5 overflow-hidden">
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

            {/* For 1-hour sessions, only show the course name to avoid clutter.
                For longer sessions, show full details (code, instructor, units) as before. */}
            {!isOneHourSession && (
              <>
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
              </>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="max-w-xs p-2 z-[999]"
        sideOffset={8}
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

const CourseCell = ({
  sessions = [],
  ghost = false,
  conflictPreview = false,
}: CourseCellProps) => {
  const { t } = useTranslation();
  const { selectedCourses, setEditingCourse } = useSchedule();

  if (!sessions || sessions.length === 0) return null;

  // Check for odd/even week split (2 sessions with different week types)
  const hasDualWeek =
    sessions.length === 2 &&
    sessions[0].weekType !== 'both' &&
    sessions[1].weekType !== 'both' &&
    sessions[0].weekType !== sessions[1].weekType;

  // True conflict: more than 2 sessions, or 2+ sessions with same week type
  const hasConflict = sessions.length > 1 && !hasDualWeek;

  // Stacked conflict view - show all courses layered
  if (hasConflict) {
    return (
      <div
        className={cn(
          'absolute inset-[1px] rounded-sm overflow-visible',
          ghost && 'opacity-60 pointer-events-none',
        )}
      >
        {/* Conflict indicator badge - z-index set to NOT overlap dialogs */}
        <div className="absolute -top-1 -left-1 z-[10] flex items-center gap-0.5 bg-destructive text-destructive-foreground px-1 py-0.5 rounded text-[8px] font-bold shadow-md">
          <AlertTriangle className="w-2.5 h-2.5" />
          {t('course.conflictIndicator', { count: sessions.length })}
        </div>

        {/* Stacked courses */}
        <div className="relative w-full h-full">
          {sessions.map((session, index) => (
            <SingleBlock
              key={`${session.parentId}-${session.day}-${session.startTime}-${session.weekType}-${index}`}
              session={session}
              isStacked={true}
              stackIndex={index}
              totalStacked={sessions.length}
              ghost={ghost}
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
          'absolute inset-[1px] rounded-sm overflow-visible',
          ghost && 'opacity-60 pointer-events-none',
        )}
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
        ghost && 'opacity-60 pointer-events-none',
      )}
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
