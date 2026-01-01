import { ScheduledCourse } from '@/types/course';

interface CourseBlockProps {
  course: ScheduledCourse;
}

const CourseBlock = ({ course }: CourseBlockProps) => {
  const colorClasses = {
    blue: 'bg-course-blue',
    green: 'bg-course-green',
    orange: 'bg-course-orange',
    purple: 'bg-course-purple',
    pink: 'bg-course-pink',
    teal: 'bg-course-teal'
  };

  const duration = course.endTime - course.startTime;

  return (
    <div
      className={`absolute inset-x-1 rounded-lg p-2 ${colorClasses[course.color]} text-foreground shadow-sm overflow-hidden`}
      style={{
        top: '2px',
        bottom: '2px',
        height: `calc(${duration * 100}% - 4px)`
      }}
    >
      <p className="font-semibold text-xs truncate">{course.name}</p>
      <p className="text-xs opacity-80 truncate">{course.location}</p>
    </div>
  );
};

export default CourseBlock;
