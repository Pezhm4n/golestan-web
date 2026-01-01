import { ScheduledCourse } from '@/types/course';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseCellProps {
  courses: ScheduledCourse[];
  rowSpan?: number;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-course-blue',
  green: 'bg-course-green',
  orange: 'bg-course-orange',
  purple: 'bg-course-purple',
  pink: 'bg-course-pink',
  teal: 'bg-course-teal',
};

const SingleCourseBlock = ({ course, isHalf = false, position }: { 
  course: ScheduledCourse; 
  isHalf?: boolean;
  position?: 'top' | 'bottom';
}) => {
  const weekLabel = course.weekType === 'odd' ? 'فرد' : course.weekType === 'even' ? 'زوج' : null;
  
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              flex flex-col justify-between overflow-hidden cursor-pointer
              ${colorClasses[course.color]} 
              border-r-2 border-r-foreground/30
              hover:brightness-95 transition-all
              ${isHalf ? 'h-1/2' : 'h-full'}
              ${isHalf && position === 'top' ? 'border-b border-dashed border-foreground/30' : ''}
              px-1 py-0.5
            `}
          >
            {/* Week Type Badge */}
            {weekLabel && (
              <span className={`
                absolute top-0 left-0 text-[8px] px-1 py-0 font-bold
                ${course.weekType === 'odd' ? 'bg-amber-400/90 text-amber-900' : 'bg-sky-400/90 text-sky-900'}
              `}>
                {weekLabel}
              </span>
            )}

            <div className={`flex flex-col ${weekLabel ? 'mt-2.5' : ''}`}>
              <p className={`font-bold text-foreground leading-tight truncate ${isHalf ? 'text-[9px]' : 'text-[10px]'}`}>
                {course.name}
              </p>
              {!isHalf && (
                <p className="text-[9px] text-foreground/70 truncate">
                  {course.instructor}
                </p>
              )}
            </div>

            <p className={`text-foreground/60 text-left ${isHalf ? 'text-[7px]' : 'text-[8px]'}`}>
              {course.location}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-2 text-xs" sideOffset={5}>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">{course.name}</h4>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
              <span className="text-muted-foreground">استاد:</span>
              <span>{course.instructor}</span>
              <span className="text-muted-foreground">مکان:</span>
              <span>{course.location}</span>
              <span className="text-muted-foreground">واحد:</span>
              <span>{course.credits}</span>
              {course.examDate && (
                <>
                  <span className="text-muted-foreground">امتحان:</span>
                  <span>{course.examDate}</span>
                </>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CourseCell = ({ courses, rowSpan = 1 }: CourseCellProps) => {
  if (courses.length === 0) {
    return null;
  }

  const hasDualCourse = courses.length === 2;
  const hasConflict = courses.length > 2 || 
    (hasDualCourse && courses[0].weekType === courses[1].weekType);

  if (hasConflict) {
    return (
      <div 
        className="absolute inset-[1px] bg-destructive/30 border-2 border-dashed border-destructive flex items-center justify-center"
      >
        <span className="text-[10px] font-bold text-destructive">تداخل!</span>
      </div>
    );
  }

  if (hasDualCourse) {
    const oddCourse = courses.find(c => c.weekType === 'odd') || courses[0];
    const evenCourse = courses.find(c => c.weekType === 'even') || courses[1];
    
    return (
      <div className="absolute inset-[1px] flex flex-col">
        <SingleCourseBlock course={oddCourse} isHalf={true} position="top" />
        <SingleCourseBlock course={evenCourse} isHalf={true} position="bottom" />
      </div>
    );
  }

  return (
    <div className="absolute inset-[1px]">
      <SingleCourseBlock course={courses[0]} />
    </div>
  );
};

export default CourseCell;