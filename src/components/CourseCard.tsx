import { Plus, Trash2, User, Calendar, BookOpen, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  isSelected?: boolean;
  onAdd?: (course: Course) => void;
  onRemove?: (course: Course) => void;
}

const CourseCard = ({ course, isSelected = false, onAdd, onRemove }: CourseCardProps) => {
  const colorClasses = {
    blue: 'border-r-blue-500',
    green: 'border-r-green-500',
    orange: 'border-r-orange-500',
    purple: 'border-r-purple-500',
    pink: 'border-r-pink-500',
    teal: 'border-r-teal-500'
  };

  const typeLabels = {
    theoretical: 'نظری',
    practical: 'عملی',
    both: 'نظری-عملی'
  };

  const typeIcons = {
    theoretical: BookOpen,
    practical: FlaskConical,
    both: BookOpen
  };

  const TypeIcon = typeIcons[course.type];
  const isFull = course.enrolled >= course.capacity;

  return (
    <Card 
      className={`
        p-2.5 border-r-4 transition-all duration-200
        ${colorClasses[course.color]}
        ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-card hover:bg-accent/30'}
        ${isFull ? 'opacity-60' : ''}
      `}
    >
      {/* Header: Name + Course ID */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[13px] text-card-foreground leading-tight truncate">
            {course.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {course.courseId}
          </p>
        </div>
      </div>

      {/* Details Rows */}
      <div className="space-y-1.5 mb-2.5">
        {/* Instructor */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{course.instructor}</span>
        </div>
        
        {/* Exam Date */}
        {course.examDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {course.examDate}
              {course.examTime && ` - ${course.examTime}`}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Badges + Action */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Units Badge */}
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
            {course.credits} واحد
          </Badge>
          
          {/* Type Badge */}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
            <TypeIcon className="h-2.5 w-2.5" />
            {typeLabels[course.type]}
          </Badge>
          
          {/* Capacity Badge */}
          <Badge 
            variant={isFull ? "destructive" : "outline"} 
            className="text-[10px] px-1.5 py-0 h-5"
          >
            {course.enrolled}/{course.capacity}
          </Badge>

          {/* General Course Badge */}
          {course.isGeneral && (
            <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
              عمومی
            </Badge>
          )}
        </div>

        {/* Action Button */}
        {isSelected ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove?.(course)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 hover:bg-primary/20 hover:text-primary"
            onClick={() => onAdd?.(course)}
            disabled={isFull}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
