import { X } from 'lucide-react';
import { ScheduledSession } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseCellProps {
  sessions?: ScheduledSession[];
}

const colorClasses: Record<string, string> = {
  blue: 'bg-course-blue',
  green: 'bg-course-green',
  orange: 'bg-course-orange',
  purple: 'bg-course-purple',
  pink: 'bg-course-pink',
  teal: 'bg-course-teal',
};

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
  
  const isHighlighted = hoveredCourseId === session.courseId;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== session.courseId;
  const weekLabel = session.weekType === 'odd' ? 'فرد' : session.weekType === 'even' ? 'زوج' : null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeCourse(session.courseId);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              group relative flex flex-col justify-between overflow-hidden cursor-pointer
              ${colorClasses[session.color]} 
              border-r-2 border-r-foreground/40
              transition-all duration-150
              ${isHalf ? 'h-1/2' : 'h-full'}
              ${isHalf && position === 'top' ? 'border-b border-dashed border-foreground/30' : ''}
              ${isHighlighted ? 'ring-2 ring-primary ring-offset-1 scale-[1.02] z-20 shadow-lg brightness-110' : ''}
              ${isDimmed ? 'opacity-40' : ''}
              px-1 py-0.5
            `}
            onMouseEnter={() => setHoveredCourseId(session.courseId)}
            onMouseLeave={() => setHoveredCourseId(null)}
          >
            {/* Delete Button - appears on hover */}
            <button
              onClick={handleRemove}
              className={`
                absolute top-0 left-0 z-30
                w-4 h-4 flex items-center justify-center
                bg-destructive text-destructive-foreground
                opacity-0 group-hover:opacity-100
                transition-opacity duration-100
                hover:bg-destructive/80
              `}
            >
              <X className="w-3 h-3" />
            </button>

            {/* Week Type Badge */}
            {weekLabel && (
              <span className={`
                absolute top-0 right-0 text-[7px] px-0.5 font-bold
                ${session.weekType === 'odd' ? 'bg-amber-400/90 text-amber-900' : 'bg-sky-400/90 text-sky-900'}
              `}>
                {weekLabel}
              </span>
            )}

            <div className={`flex flex-col ${weekLabel ? 'mt-2' : ''}`}>
              <p className={`font-bold text-foreground leading-tight truncate ${isHalf ? 'text-[8px]' : 'text-[9px]'}`}>
                {session.courseName}
              </p>
              {!isHalf && (
                <p className="text-[8px] text-foreground/70 truncate">
                  {session.instructor}
                </p>
              )}
            </div>

            <p className={`text-foreground/60 text-left ${isHalf ? 'text-[6px]' : 'text-[7px]'}`}>
              {session.location}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-2" sideOffset={5}>
          <div className="space-y-1 text-[11px]">
            <h4 className="font-bold text-sm">{session.courseName}</h4>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
              <span className="text-muted-foreground">استاد:</span>
              <span>{session.instructor}</span>
              <span className="text-muted-foreground">مکان:</span>
              <span>{session.location}</span>
              <span className="text-muted-foreground">واحد:</span>
              <span>{session.credits}</span>
              {session.examDate && (
                <>
                  <span className="text-muted-foreground">امتحان:</span>
                  <span>{session.examDate}</span>
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
      <div className="absolute inset-[1px] bg-destructive/30 border-2 border-dashed border-destructive flex items-center justify-center">
        <span className="text-[9px] font-bold text-destructive">تداخل!</span>
      </div>
    );
  }

  if (hasDual) {
    const oddSession = sessions.find(s => s.weekType === 'odd') || sessions[0];
    const evenSession = sessions.find(s => s.weekType === 'even') || sessions[1];
    
    return (
      <div className="absolute inset-[1px] flex flex-col">
        <SingleBlock session={oddSession} isHalf={true} position="top" />
        <SingleBlock session={evenSession} isHalf={true} position="bottom" />
      </div>
    );
  }

  return (
    <div className="absolute inset-[1px]">
      <SingleBlock session={sessions[0]} />
    </div>
  );
};

export default CourseCell;