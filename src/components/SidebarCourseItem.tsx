import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course } from '@/types/course';

interface SidebarCourseItemProps {
  course: Course;
  isSelected: boolean;
  onAdd?: (course: Course) => void;
  onRemove?: (course: Course) => void;
}

const SidebarCourseItem = ({ course, isSelected, onAdd, onRemove }: SidebarCourseItemProps) => {
  const isFull = course.enrolled >= course.capacity;
  
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/50 hover:bg-muted/50 transition-colors text-[11px]">
      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-foreground truncate">{course.name}</span>
          <span className="text-muted-foreground shrink-0">({course.courseId})</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
          <span className="truncate">{course.instructor}</span>
          <span className="shrink-0">{course.credits} واحد</span>
          <span className={`shrink-0 ${isFull ? 'text-destructive' : ''}`}>
            {course.enrolled}/{course.capacity}
          </span>
        </div>
      </div>
      
      {/* Action Button */}
      {isSelected ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove?.(course)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onAdd?.(course)}
          disabled={isFull}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default SidebarCourseItem;