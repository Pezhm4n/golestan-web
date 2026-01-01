import { X } from 'lucide-react';
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
  position 
}: { 
  session: ScheduledSession; 
  isHalf?: boolean;
  position?: 'top' | 'bottom';
}) => {
  const { hoveredCourseId, setHoveredCourseId, removeCourse } = useSchedule();
  const { getFontSizeClass, fontSize } = useSettings();
  
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark');
  const backgroundColor = getCourseColor(session.parentId, session.group, isDark);
  
  const isHighlighted = hoveredCourseId === session.parentId;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== session.parentId;
  const weekLabel = session.weekType === 'odd' ? 'فرد' : session.weekType === 'even' ? 'زوج' : null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCourse(session.parentId);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              group relative flex flex-col justify-center items-center text-center overflow-hidden cursor-pointer
              border-r-2 border-r-foreground/40
              transition-all duration-200
              ${isHalf ? 'h-1/2' : 'h-full'}
              ${isHalf && position === 'top' ? 'border-b border-dashed border-foreground/30' : ''}
              ${isHighlighted 
                ? 'ring-2 ring-offset-1 ring-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)] scale-[1.02] z-50' 
                : ''
              }
              ${isDimmed ? 'opacity-80' : ''}
              px-1 py-0.5
              rounded-sm
            `}
            style={{ backgroundColor }}
            onMouseEnter={() => setHoveredCourseId(session.parentId)}
            onMouseLeave={() => setHoveredCourseId(null)}
          >
            {/* Delete Button - appears on hover */}
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 z-30 w-4 h-4 flex items-center justify-center bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/80 rounded-sm"
            >
              <X className="w-2.5 h-2.5" />
            </button>

            {/* Week Type Badge */}
            {weekLabel && (
              <span className={`
                absolute top-0 left-0 text-[7px] px-0.5 font-bold rounded-br-sm
                ${session.weekType === 'odd' ? 'bg-amber-400/90 text-amber-900' : 'bg-sky-400/90 text-sky-900'}
              `}>
                {weekLabel}
              </span>
            )}

            {/* Content - Centered Layout */}
            <div className="flex flex-col items-center w-full px-1">
              {/* Line 1: Course Name */}
              <p className={cn(
                "font-bold text-foreground leading-tight truncate w-full",
                isHalf 
                  ? "text-[8px]" 
                  : fontSize === 'small' ? "text-[10px]" : fontSize === 'large' ? "text-sm" : "text-xs"
              )}>
                {session.courseName}
              </p>
              
              {/* Line 2: Instructor */}
              {!isHalf && (
                <p className={cn(
                  "text-foreground/70 truncate w-full font-light",
                  fontSize === 'small' ? "text-[8px]" : fontSize === 'large' ? "text-xs" : "text-[10px]"
                )}>
                  {session.instructor}
                </p>
              )}
              
              {/* Line 3: Course Code */}
              <p className={cn(
                "text-foreground/60 truncate w-full",
                isHalf ? "text-[6px]" : fontSize === 'small' ? "text-[7px]" : fontSize === 'large' ? "text-[10px]" : "text-[8px]"
              )}>
                کد: {session.courseId}
              </p>
              
              {/* Line 4: Units + Group */}
              <div className="flex items-center gap-1 mt-0.5">
                <span className={cn(
                  "bg-foreground/20 text-foreground/80 px-1.5 rounded font-medium",
                  isHalf ? "text-[6px]" : fontSize === 'small' ? "text-[7px]" : fontSize === 'large' ? "text-[10px]" : "text-[8px]"
                )}>
                  {session.credits} واحد
                </span>
                <span className={cn(
                  "text-foreground/50",
                  isHalf ? "text-[5px]" : fontSize === 'small' ? "text-[6px]" : fontSize === 'large' ? "text-[9px]" : "text-[7px]"
                )}>
                  ({GROUP_LABELS[session.group]})
                </span>
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

  const hasDual = sessions.length === 2;
  const hasConflict = sessions.length > 2 || 
    (hasDual && sessions[0].weekType === sessions[1].weekType);

  if (hasConflict) {
    return (
      <div className="absolute inset-[1px] bg-destructive/30 border-2 border-dashed border-destructive flex items-center justify-center rounded-sm">
        <span className="text-[9px] font-bold text-destructive">تداخل!</span>
      </div>
    );
  }

  if (hasDual) {
    const oddSession = sessions.find(s => s.weekType === 'odd') || sessions[0];
    const evenSession = sessions.find(s => s.weekType === 'even') || sessions[1];
    
    return (
      <div className="absolute inset-[1px] flex flex-col rounded-sm overflow-hidden">
        <SingleBlock session={oddSession} isHalf={true} position="top" />
        <SingleBlock session={evenSession} isHalf={true} position="bottom" />
      </div>
    );
  }

  return (
    <div className="absolute inset-[1px] rounded-sm overflow-hidden">
      <SingleBlock session={sessions[0]} />
    </div>
  );
};

export default CourseCell;
