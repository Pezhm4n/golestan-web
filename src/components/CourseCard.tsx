import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  onAdd: (course: Course) => void;
}

const CourseCard = ({ course, onAdd }: CourseCardProps) => {
  const colorClasses = {
    blue: 'border-r-4 border-r-course-blue',
    green: 'border-r-4 border-r-course-green',
    orange: 'border-r-4 border-r-course-orange',
    purple: 'border-r-4 border-r-course-purple',
    pink: 'border-r-4 border-r-course-pink',
    teal: 'border-r-4 border-r-course-teal'
  };

  return (
    <Card className={`p-3 bg-card hover:bg-accent/30 transition-colors ${colorClasses[course.color]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-card-foreground truncate">
            {course.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {course.instructor}
          </p>
          <p className="text-xs text-muted-foreground">
            {course.credits} واحد
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-primary/20 hover:text-primary"
          onClick={() => onAdd(course)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default CourseCard;
