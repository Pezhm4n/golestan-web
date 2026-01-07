import { Plus, Check, AlertTriangle, Pencil } from 'lucide-react';
import { Course } from '@/types/course';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface SidebarCourseItemProps {
  course: Course;
}

const SidebarCourseItem = ({ course }: SidebarCourseItemProps) => {
  const {
    isCourseSelected,
    toggleCourse,
    hasConflict,
    hoveredCourseId,
    setHoveredCourseId,
    removeCustomCourse,
    setEditingCourse,
  } = useSchedule();
  const { getFontSizeClass } = useSettings();
  const { t } = useTranslation();

  const isSelected = isCourseSelected(course.id);
  const conflict = !isSelected ? hasConflict(course) : { hasConflict: false };
  const isHighlighted = hoveredCourseId === course.id;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== course.id;
  const isCustom = course.departmentId === 'custom';
  const groupLabel = (course.groupNumber ?? 1).toString().padStart(2, '0');

  const handleClick = () => {
    toggleCourse(course);
  };

  const handleDeleteCustom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCustom) return;
    removeCustomCourse(course.id);
  };

  const handleEditCustom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCustom) return;
    setEditingCourse(course);
  };

  return (
      <HoverCard openDelay={700} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
              dir="rtl"
              className={cn(
                  // تغییر: اضافه کردن items-center برای تراز عمودی بهتر آیکون با متن
                  "flex w-full items-center gap-2 px-2 py-2 border-b border-border/30 transition-all duration-200 cursor-pointer hover:bg-accent/50",
                  // اطمینان از اینکه عرض آیتم از والدش بیشتر نمیشود
                  "max-w-full overflow-hidden",
                  getFontSizeClass(),
                  isSelected && "bg-primary/10 border-r-2 border-r-primary",
                  !isSelected && conflict.hasConflict && "bg-destructive/5 border-r-2 border-r-destructive/50",
                  isHighlighted && "bg-primary/15 shadow-sm scale-[1.01]",
                  isDimmed && "opacity-80"
              )}
              onClick={handleClick}
              onMouseEnter={() => setHoveredCourseId(course.id)}
              onMouseLeave={() => setHoveredCourseId(null)}
          >
            {/* Status Icon - با shrink-0 که جمع نشود */}
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
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

            {/* Course Info - تغییر ساختار به CSS Grid */}
            <div
                className={cn(
                    "grid grid-cols-[1fr_auto] gap-x-2 items-center flex-1 min-w-0", // Grid layout
                    getFontSizeClass()
                )}
            >
              {/* ستون اول: اطلاعات متنی (نام درس و استاد) */}
              {/* min-w-0 اینجا حیاتی است تا truncate کار کند */}
              <div className="flex flex-col min-w-0 overflow-hidden">
                {/* نام درس */}
                <div
                  dir="rtl"
                  className="truncate text-right font-normal text-foreground leading-snug"
                  title={course.name}
                >
                  {course.name}
                </div>

                {/* نام استاد */}
                {course.instructor && (
                  <div
                    dir="rtl"
                    className="truncate text-right text-[11px] text-muted-foreground leading-snug"
                  >
                    {course.instructor}
                  </div>
                )}

                {/* توضیحات کوتاه درس (در صورت وجود) */}
                {course.description && course.description.trim() !== '' && (
                  <div
                    dir="rtl"
                    className="mt-0.5 truncate text-right text-[10px] text-muted-foreground/80 leading-snug"
                    title={course.description}
                  >
                    {course.description}
                  </div>
                )}
              </div>

              {/* ستون دوم: وضعیت (گروه + برچسب‌ها) */}
              {/* shrink-0 باعث میشود این ستون همیشه عرض کاملش را داشته باشد و له نشود */}
              <div className="flex flex-col items-end gap-0.5 shrink-0 text-[11px]">
                <span className="text-muted-foreground whitespace-nowrap leading-none">
                  {t('course.labels.group')} {groupLabel}
                </span>
                {isCustom && (
                  <Badge
                    variant="secondary"
                    className="h-3.5 px-1 text-[8px] mr-0 whitespace-nowrap flex items-center"
                  >
                    {t('sidebar.customCoursesHeader')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Custom course actions: edit & delete */}
            {isCustom && (
              <div className="flex items-center gap-1 ml-1 shrink-0">
                <button
                  onClick={handleEditCustom}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/90 text-white shadow-sm transition-colors hover:bg-amber-600"
                  aria-label={t('course.actions.edit', 'Edit course')}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDeleteCustom}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/90 text-white shadow-sm transition-colors hover:bg-red-600"
                  aria-label={t('course.actions.delete', 'Delete course')}
                >
                  <AlertTriangle className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </HoverCardTrigger>

        <HoverCardContent side="left" align="start" className="w-72 p-3 z-[100]" sideOffset={16}>
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-bold text-foreground">{course.name}</h4>
              <p className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                ({course.courseId})
              </p>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
              <span className="text-muted-foreground">{t('course.labels.instructor')}</span>
              <span className="text-foreground">{course.instructor}</span>
              <span className="text-muted-foreground">{t('course.labels.units')}</span>
              <span className="text-foreground">{course.credits}</span>
              <span className="text-muted-foreground">{t('course.labels.type')}</span>
              <span className="text-foreground">
              {course.type === 'theoretical'
                ? t('course.type.theoretical')
                : course.type === 'practical'
                ? t('course.type.practical')
                : t('course.type.theoreticalPractical')}
            </span>
              {course.examDate && (
                  <>
                    <span className="text-muted-foreground">{t('course.labels.exam')}</span>
                    <span className="text-foreground font-medium">
                  {course.examDate} {course.examTime && `- ${course.examTime}`}
                </span>
                  </>
              )}
              {course.description && (
                  <>
                    <span className="text-muted-foreground">{t('course.labels.description')}</span>
                    <span className="text-foreground/80 text-[10px]">{course.description}</span>
                  </>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1">{t('course.labels.sessions')}</p>
              <div className="space-y-0.5">
                {course.sessions.map((session, idx) => (
                  <div key={idx} className="text-[10px] text-foreground/80 flex items-center gap-2">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[9px]">
                      {t(`days.${session.day}`)}
                    </span>
                    <span>
                      {session.startTime.toString().padStart(2, '0')}:00 -{' '}
                      {session.endTime.toString().padStart(2, '0')}:00
                    </span>
                    {session.weekType !== 'both' && (
                      <Badge variant="outline" className="h-4 text-[8px] px-1">
                        {session.weekType === 'odd'
                          ? t('course.weekType.odd')
                          : t('course.weekType.even')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {conflict.hasConflict && (
                <div className="flex items-center gap-1.5 text-destructive text-[10px] pt-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t('course.labels.conflictWith')} {conflict.conflictWith}
                </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
  );
};

export default SidebarCourseItem;