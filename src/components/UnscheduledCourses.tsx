import React, { useMemo } from 'react';
import { X, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Course } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { getCourseColor } from '@/hooks/useCourseColors';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UnscheduledCoursesProps {
  courses: Course[];
}

/**
 * Shows selected courses that have no concrete time schedule
 * (e.g. internship, project, thesis).
 *
 * A course is considered \"unscheduled\" if it has no session with a valid
 * numeric startTime and endTime.
 */
const UnscheduledCourses: React.FC<UnscheduledCoursesProps> = ({ courses }) => {
  const { t } = useTranslation();
  const { removeCourse, setEditingCourse } = useSchedule();

  const unscheduled = useMemo(() => {
    const isTimedSession = (session: Course['sessions'][number]) =>
      typeof session.startTime === 'number' &&
      typeof session.endTime === 'number' &&
      !Number.isNaN(session.startTime) &&
      !Number.isNaN(session.endTime);

    return courses.filter(course => !course.sessions.some(isTimedSession));
  }, [courses]);

  if (!unscheduled.length) {
    return null;
  }

  const totalUnits = unscheduled.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="px-2 pb-2 md:px-4 md:pb-4">
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-muted/40 px-3 py-2 md:px-4 md:py-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-gray-800 md:text-sm" dir="rtl">
            دروس بدون ساعت مشخص
          </h3>
          <span className="text-[10px] text-muted-foreground md:text-xs" dir="rtl">
            {unscheduled.length} درس • {totalUnits} {t('labels.units')}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {unscheduled.map(course => {
            const bgColor = getCourseColor(course.id, course.group);

            return (
              <Tooltip key={course.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'group relative flex items-center gap-1 rounded-full border border-black/5 px-3 py-1 text-[11px] shadow-sm',
                      'max-w-full bg-white/80 backdrop-blur-sm cursor-pointer',
                    )}
                    style={{
                      // Use course color as a soft accent via left border & subtle background overlay
                      borderColor: 'rgba(0,0,0,0.06)',
                      boxShadow: `0 1px 4px rgba(15, 23, 42, 0.08)`,
                      backgroundImage: `linear-gradient(to right, ${bgColor}22, ${bgColor}11)`,
                    }}
                  >
                    <span
                      className="block max-w-[9rem] truncate font-semibold text-gray-900 md:max-w-[13rem]"
                      dir="rtl"
                      title={course.name}
                    >
                      {course.name}
                    </span>

                    <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[9px] font-medium text-gray-900 whitespace-nowrap">
                      {course.credits} {t('labels.units')}
                    </span>

                    {course.id.startsWith('custom_') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCourse(course);
                        }}
                        className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/90 text-white transition-colors hover:bg-amber-600"
                        aria-label="ویرایش درس"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCourse(course.id);
                      }}
                      className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/90 text-white transition-colors hover:bg-red-600"
                      aria-label="حذف درس"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="text-[11px]" dir="rtl">
                  <div className="space-y-0.5">
                    <div className="font-semibold">{course.name}</div>
                    <div className="flex gap-1">
                      <span className="text-muted-foreground">کد:</span>
                      <span dir="ltr" className="font-mono">
                        {course.courseId}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-muted-foreground">نوع:</span>
                      <span>{course.group === 'specialized' ? 'تخصصی' : course.group === 'general' ? 'عمومی' : 'پایه'}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-muted-foreground">استاد:</span>
                      <span>{course.instructor || '—'}</span>
                    </div>
                    {course.examDate && (
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">امتحان:</span>
                        <span>
                          {course.examDate}
                          {course.examTime ? ` • ${course.examTime}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UnscheduledCourses;