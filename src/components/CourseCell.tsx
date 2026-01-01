import { X, AlertTriangle } from 'lucide-react';
import { ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getCourseColor, GROUP_LABELS } from '@/hooks/useCourseColors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CourseCellProps {
  sessions?: ScheduledSession[];
}

const SingleBlock = ({ 
  session, 
  isHalf = false,
  isStacked = false,
  stackIndex = 0,
  totalStacked = 1,
  position 
}: { 
  session: ScheduledSession; 
  isHalf?: boolean;
  isStacked?: boolean;
  stackIndex?: number;
  totalStacked?: number;
  position?: 'top' | 'bottom';
}) => {
  const { hoveredCourseId, setHoveredCourseId, removeCourse } = useSchedule();
  const { getFontSizeClass, fontSize } = useSettings();
  
  const backgroundColor = getCourseColor(session.parentId, session.group);
  
  const isHighlighted = hoveredCourseId === session.parentId;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== session.parentId;
  const weekLabel = session.weekType === 'odd' ? 'فرد' : session.weekType === 'even' ? 'زوج' : null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCourse(session.parentId);
  };

  // Calculate offset for stacked view - more spacing for easier hover
  const baseStackOffset = isStacked ? stackIndex * 20 : 0;
  const stackWidth = isStacked ? `calc(100% - ${(totalStacked - 1) * 20}px)` : '100%';
  
  // When hovered, bring to front with z-index 100
  const getZIndex = () => {
    if (isHighlighted) return 100;
    if (isStacked) return totalStacked - stackIndex;
    return 1;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "group relative flex flex-col justify-center items-center text-center overflow-hidden cursor-pointer",
              "border-r-[3px] border-r-gray-700/50 rounded-lg",
              // Faster transitions for mobile
              "transition-all duration-150",
              isHalf ? 'h-1/2' : 'h-full',
              isHalf && position === 'top' ? 'border-b border-dashed border-gray-500/40' : '',
              isHighlighted && 'ring-2 ring-offset-1 ring-primary shadow-lg scale-[1.01]',
              isDimmed && 'opacity-50',
              // Responsive padding
              'p-1.5 sm:p-2 md:p-2.5',
              isStacked && 'absolute shadow-xl border border-gray-600/40',
              // Touch feedback
              'active:scale-[0.98]'
            )}
            style={{ 
              backgroundColor,
              ...(isStacked && {
                right: `${baseStackOffset}px`,
                top: `${baseStackOffset}px`,
                width: stackWidth,
                height: `calc(100% - ${baseStackOffset}px)`,
                zIndex: getZIndex(),
              })
            }}
            onMouseEnter={() => setHoveredCourseId(session.parentId)}
            onMouseLeave={() => setHoveredCourseId(null)}
            onTouchStart={() => setHoveredCourseId(session.parentId)}
            onTouchEnd={() => setHoveredCourseId(null)}
          >
            {/* Delete Button - larger touch target on mobile */}
            <button
              onClick={handleRemove}
              className={cn(
                "absolute z-30 flex items-center justify-center bg-red-500/90 text-white transition-all duration-200 hover:bg-red-600 rounded-md shadow-sm",
                // Larger on mobile, visible by default on touch
                "top-1 right-1 w-6 h-6 opacity-100 sm:top-2 sm:right-2 sm:w-5 sm:h-5 sm:opacity-0 sm:group-hover:opacity-100"
              )}
            >
              <X className="w-3 h-3 sm:w-3 sm:h-3" />
            </button>

            {/* Week Type Badge */}
            {weekLabel && (
              <span className={`
                absolute top-1 left-1 text-[8px] px-1.5 py-0.5 font-bold rounded-md shadow-sm
                ${session.weekType === 'odd' ? 'bg-amber-400/95 text-amber-900' : 'bg-sky-400/95 text-sky-900'}
              `}>
                {weekLabel}
              </span>
            )}

            {/* Content - Centered Layout with responsive text */}
            <div className="flex flex-col items-center justify-center w-full h-full text-center gap-0.5 overflow-hidden">
              {/* Title - Truncated to prevent overflow */}
              <h3 className={cn(
                "font-bold text-gray-900 leading-tight w-full truncate",
                isHalf ? "text-[9px]" 
                  : fontSize === 'small' ? "text-[10px]" : fontSize === 'large' ? "text-sm" : "text-xs"
              )}>
                {session.courseName}
              </h3>
              
              {/* Subtitle - Instructor */}
              {!isHalf && (
                <p className={cn(
                  "text-gray-700 truncate w-full",
                  fontSize === 'small' ? "text-[8px]" : fontSize === 'large' ? "text-xs" : "text-[10px]"
                )}>
                  {session.instructor}
                </p>
              )}
              
              {/* Metadata Row - Credits and Group Number */}
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {/* Credits Badge */}
                <span className={cn(
                  "bg-gray-800/15 text-gray-800 px-1 py-0.5 rounded font-semibold whitespace-nowrap",
                  isHalf ? "text-[6px]" : fontSize === 'small' ? "text-[7px]" : fontSize === 'large' ? "text-[10px]" : "text-[8px]"
                )}>
                  {session.credits} واحد
                </span>
                
                {/* Group Number Badge */}
                {session.groupNumber && (
                  <span className={cn(
                    "bg-gray-700/10 text-gray-700 px-1 py-0.5 rounded whitespace-nowrap",
                    isHalf ? "text-[6px]" : fontSize === 'small' ? "text-[7px]" : fontSize === 'large' ? "text-[10px]" : "text-[8px]"
                  )}>
                    گروه {session.groupNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-2" sideOffset={8}>
          <div className="space-y-1 text-[11px]">
            <h4 className="font-bold text-sm">{session.courseName} ({session.courseId})</h4>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
              <span className="text-muted-foreground">استاد:</span>
              <span>{session.instructor}</span>
              <span className="text-muted-foreground">مکان:</span>
              <span>{session.location}</span>
              <span className="text-muted-foreground">واحد:</span>
              <span>{session.credits}</span>
              <span className="text-muted-foreground">نوع:</span>
              <span>{GROUP_LABELS[session.group]}</span>
              {session.examDate && (
                <>
                  <span className="text-muted-foreground">امتحان:</span>
                  <span>{session.examDate} - {session.examTime}</span>
                </>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CourseCell = ({ sessions = [] }: CourseCellProps) => {
  if (!sessions || sessions.length === 0) return null;

  // Check for odd/even week split (2 sessions with different week types)
  const hasDualWeek = sessions.length === 2 && 
    sessions[0].weekType !== 'both' && 
    sessions[1].weekType !== 'both' &&
    sessions[0].weekType !== sessions[1].weekType;

  // True conflict: more than 2 sessions, or 2+ sessions with same week type
  const hasConflict = sessions.length > 1 && !hasDualWeek;

  // Stacked conflict view - show all courses layered
  if (hasConflict) {
    return (
      <div className="absolute inset-[1px] rounded-sm overflow-visible">
        {/* Conflict indicator badge - z-index set to NOT overlap dialogs */}
        <div className="absolute -top-1 -left-1 z-[10] flex items-center gap-0.5 bg-destructive text-destructive-foreground px-1 py-0.5 rounded text-[8px] font-bold shadow-md">
          <AlertTriangle className="w-2.5 h-2.5" />
          تداخل ({sessions.length})
        </div>
        
        {/* Stacked courses */}
        <div className="relative w-full h-full">
          {sessions.map((session, index) => (
            <SingleBlock 
              key={session.parentId} 
              session={session} 
              isStacked={true}
              stackIndex={index}
              totalStacked={sessions.length}
            />
          ))}
        </div>
      </div>
    );
  }

  // Dual week view (odd/even)
  if (hasDualWeek) {
    const oddSession = sessions.find(s => s.weekType === 'odd') || sessions[0];
    const evenSession = sessions.find(s => s.weekType === 'even') || sessions[1];
    
    return (
      <div className="absolute inset-[1px] flex flex-col rounded-sm overflow-hidden">
        <SingleBlock session={oddSession} isHalf={true} position="top" />
        <SingleBlock session={evenSession} isHalf={true} position="bottom" />
      </div>
    );
  }

  // Single course
  return (
    <div className="absolute inset-[1px] rounded-sm overflow-hidden">
      <SingleBlock session={sessions[0]} />
    </div>
  );
};

export default CourseCell;
