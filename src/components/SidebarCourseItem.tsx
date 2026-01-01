import { Plus, Check, AlertTriangle } from 'lucide-react';
import { Course } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Badge } from '@/components/ui/badge';

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
  const isHighlighted = hoveredCourseId === course.id;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== course.id;
  
  const handleClick = () => {
    toggleCourse(course);
  };

  return (
    <div 
      className={`
        flex items-center gap-2 px-2 py-2 border-b border-border/30 
        transition-all duration-200 cursor-pointer text-[11px]
        hover:bg-accent/50
        ${isSelected 
          ? 'bg-primary/10 border-r-2 border-r-primary' 
          : conflict.hasConflict 
            ? 'bg-destructive/5 border-r-2 border-r-destructive/50' 
            : ''
        }
        ${isHighlighted 
          ? 'bg-primary/15 shadow-sm scale-[1.01]' 
          : ''
        }
        ${isDimmed ? 'opacity-80' : ''}
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
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground truncate">{course.name}</span>
          {course.isGeneral && (
            <Badge variant="secondary" className="h-4 px-1 text-[8px]">عمومی</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-[10px] mt-0.5">
          <span className="truncate">{course.instructor}</span>
          <span className="shrink-0 font-medium">{course.credits} واحد</span>
        </div>
      </div>
      
      {/* Sessions indicator */}
      <div className="text-[9px] text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">
        {course.sessions.length} جلسه
      </div>
    </div>
  );
};

export default SidebarCourseItem;
