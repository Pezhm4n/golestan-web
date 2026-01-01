import { Plus, Check, AlertTriangle } from 'lucide-react';
import { Course } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';

interface SidebarCourseItemProps {
  course: Course;
}

const SidebarCourseItem = ({ course }: SidebarCourseItemProps) => {
  const { 
    isCourseSelected, 
    toggleCourse, 
    hasConflict, 
    hoveredCourseId, 
    setHoveredCourseId 
  } = useSchedule();
  
  const isSelected = isCourseSelected(course.id);
  const conflict = !isSelected ? hasConflict(course) : { hasConflict: false };
  const isFull = course.enrolled >= course.capacity;
  const isHighlighted = hoveredCourseId === course.id;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== course.id;
  
  const handleClick = () => {
    if (!isFull || isSelected) {
      toggleCourse(course);
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-2 px-2 py-1.5 border-b border-border/50 
        transition-all duration-150 cursor-pointer text-[11px]
        ${isSelected 
          ? 'bg-primary/10 border-l-2 border-l-primary' 
          : conflict.hasConflict 
            ? 'bg-destructive/5 border-l-2 border-l-destructive/50' 
            : 'hover:bg-muted/50'
        }
        ${isHighlighted ? 'ring-1 ring-primary bg-primary/5' : ''}
        ${isDimmed ? 'opacity-40' : ''}
        ${isFull && !isSelected ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setHoveredCourseId(course.id)}
      onMouseLeave={() => setHoveredCourseId(null)}
    >
      {/* Status Icon */}
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {isSelected ? (
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        ) : conflict.hasConflict ? (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        ) : (
          <div className="w-4 h-4 rounded border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
            <Plus className="w-3 h-3" />
          </div>
        )}
      </div>
      
      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-foreground truncate">{course.name}</span>
          <span className="text-muted-foreground shrink-0 text-[10px]">({course.courseId})</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
          <span className="truncate">{course.instructor}</span>
          <span className="shrink-0">{course.credits}و</span>
          <span className={`shrink-0 ${isFull ? 'text-destructive font-bold' : ''}`}>
            {course.enrolled}/{course.capacity}
          </span>
        </div>
      </div>
      
      {/* Sessions indicator */}
      <div className="text-[9px] text-muted-foreground shrink-0">
        {course.sessions.length} جلسه
      </div>
    </div>
  );
};

export default SidebarCourseItem;