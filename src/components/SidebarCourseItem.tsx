import { Plus, Check, AlertTriangle } from 'lucide-react';
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
  const { getFontSizeClass } = useSettings();
  
  const isSelected = isCourseSelected(course.id);
  const conflict = !isSelected ? hasConflict(course) : { hasConflict: false };
  const isHighlighted = hoveredCourseId === course.id;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== course.id;
  
  const handleClick = () => {
    toggleCourse(course);
  };

  return (
    <HoverCard openDelay={700} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div 
          dir="rtl"
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 border-b border-border/30 transition-all duration-200 cursor-pointer hover:bg-accent/50",
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
          {/* Status Icon */}
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
          
          {/* Course Info - Single Line RTL with group number */}
          <p className={cn("flex-1 text-xs text-foreground truncate", getFontSizeClass())}>
            <span className="font-semibold">{course.name}</span>
            <span className="text-muted-foreground"> - </span>
            <span className="text-muted-foreground">{course.instructor}</span>
            <span className="text-muted-foreground"> - </span>
            <span className="text-muted-foreground">گروه {course.groupNumber || 1}</span>
            {course.isGeneral && (
              <Badge variant="secondary" className="h-4 px-1 text-[8px] mr-1.5">عمومی</Badge>
            )}
          </p>
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent side="left" align="start" className="w-72 p-3 z-[100]" sideOffset={16}>
        <div className="space-y-2">
          {/* Header */}
          <div>
            <h4 className="text-sm font-bold text-foreground">{course.name}</h4>
            <p className="text-[11px] text-muted-foreground font-mono">({course.courseId})</p>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
            <span className="text-muted-foreground">استاد:</span>
            <span className="text-foreground">{course.instructor}</span>
            
            <span className="text-muted-foreground">واحد:</span>
            <span className="text-foreground">{course.credits}</span>
            
            <span className="text-muted-foreground">نوع:</span>
            <span className="text-foreground">
              {course.type === 'theoretical' ? 'نظری' : course.type === 'practical' ? 'عملی' : 'نظری-عملی'}
            </span>
            
            {course.examDate && (
              <>
                <span className="text-muted-foreground">امتحان:</span>
                <span className="text-foreground font-medium">
                  {course.examDate} {course.examTime && `- ${course.examTime}`}
                </span>
              </>
            )}
            
            {course.description && (
              <>
                <span className="text-muted-foreground">توضیحات:</span>
                <span className="text-foreground/80 text-[10px]">{course.description}</span>
              </>
            )}
          </div>
          
          {/* Sessions */}
          <div className="pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1">جلسات:</p>
            <div className="space-y-0.5">
              {course.sessions.map((session, idx) => (
                <div key={idx} className="text-[10px] text-foreground/80 flex items-center gap-2">
                  <span className="bg-muted px-1.5 py-0.5 rounded text-[9px]">
                    {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'][session.day]}
                  </span>
                  <span>{session.startTime}:۰۰ - {session.endTime}:۰۰</span>
                  {session.weekType !== 'both' && (
                    <Badge variant="outline" className="h-4 text-[8px] px-1">
                      {session.weekType === 'odd' ? 'فرد' : 'زوج'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Conflict warning */}
          {conflict.hasConflict && (
            <div className="flex items-center gap-1.5 text-destructive text-[10px] pt-1">
              <AlertTriangle className="w-3 h-3" />
              تداخل با: {conflict.conflictWith}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SidebarCourseItem;
