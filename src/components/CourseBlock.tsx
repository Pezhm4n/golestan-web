import { ScheduledCourse } from '@/types/course';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CourseBlockProps {
  course: ScheduledCourse;
  isSplit?: boolean;
  position?: 'top' | 'bottom';
}

const CourseBlock = ({ course, isSplit = false, position }: CourseBlockProps) => {
  const colorClasses = {
    blue: 'bg-course-blue border-blue-400 dark:border-blue-600',
    green: 'bg-course-green border-green-400 dark:border-green-600',
    orange: 'bg-course-orange border-orange-400 dark:border-orange-600',
    purple: 'bg-course-purple border-purple-400 dark:border-purple-600',
    pink: 'bg-course-pink border-pink-400 dark:border-pink-600',
    teal: 'bg-course-teal border-teal-400 dark:border-teal-600'
  };

  const weekTypeLabels = {
    odd: 'فرد',
    even: 'زوج',
    both: null
  };

  const weekTypeBadgeColors = {
    odd: 'bg-amber-500/80 text-amber-950 dark:bg-amber-400/80',
    even: 'bg-sky-500/80 text-sky-950 dark:bg-sky-400/80',
    both: ''
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              absolute inset-x-0 flex flex-col justify-between overflow-hidden cursor-pointer
              ${colorClasses[course.color]} 
              border-r-2 
              transition-all duration-150 hover:shadow-md hover:z-10 hover:scale-[1.02]
              ${isSplit ? 'px-1 py-0.5' : 'px-1.5 py-1'}
              ${isSplit && position === 'top' ? 'rounded-t border-b border-dashed border-foreground/20' : ''}
              ${isSplit && position === 'bottom' ? 'rounded-b border-t border-dashed border-foreground/20' : ''}
              ${!isSplit ? 'rounded inset-y-0' : ''}
            `}
            style={{
              top: isSplit && position === 'bottom' ? '50%' : '1px',
              bottom: isSplit && position === 'top' ? '50%' : '1px',
              left: '2px',
              right: '2px',
            }}
          >
            {/* Week Type Badge */}
            {course.weekType !== 'both' && (
              <Badge 
                className={`absolute top-0.5 left-0.5 text-[9px] px-1 py-0 h-3.5 font-medium ${weekTypeBadgeColors[course.weekType]}`}
              >
                {weekTypeLabels[course.weekType]}
              </Badge>
            )}

            {/* Course Info */}
            <div className={`flex flex-col ${isSplit ? 'gap-0' : 'gap-0.5'} ${course.weekType !== 'both' ? 'mt-3' : ''}`}>
              <p className={`font-bold text-foreground leading-tight truncate ${isSplit ? 'text-[10px]' : 'text-[11px]'}`}>
                {course.name}
              </p>
              {!isSplit && (
                <p className="text-[10px] text-foreground/70 leading-tight truncate">
                  {course.instructor}
                </p>
              )}
            </div>

            {/* Location - Bottom Right */}
            <p className={`text-foreground/60 leading-none text-left ${isSplit ? 'text-[8px]' : 'text-[9px]'}`}>
              {course.location}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="max-w-xs p-3 space-y-2"
          sideOffset={8}
        >
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm">{course.name}</h4>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">استاد:</span>
              <span>{course.instructor}</span>
              
              <span className="text-muted-foreground">مکان:</span>
              <span>{course.location}</span>
              
              <span className="text-muted-foreground">واحد:</span>
              <span>{course.credits}</span>
              
              {course.examDate && (
                <>
                  <span className="text-muted-foreground">تاریخ امتحان:</span>
                  <span>{course.examDate}</span>
                </>
              )}
              
              {course.weekType !== 'both' && (
                <>
                  <span className="text-muted-foreground">هفته:</span>
                  <span>{course.weekType === 'odd' ? 'فرد' : 'زوج'}</span>
                </>
              )}
            </div>
            {course.description && (
              <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                {course.description}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CourseBlock;
