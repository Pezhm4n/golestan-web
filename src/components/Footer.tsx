import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';

const Footer = () => {
  const { totalUnits, selectedCourses, scheduledSessions } = useSchedule();

  // Calculate active days
  const activeDays = new Set(scheduledSessions.map(s => s.day)).size;

  // Check for exam conflicts
  const examDates = selectedCourses
    .filter(c => c.examDate && c.examTime)
    .map(c => ({ id: c.id, name: c.name, date: c.examDate, time: c.examTime }));
  
  const hasExamConflict = examDates.some((exam, i) => 
    examDates.some((other, j) => i !== j && exam.date === other.date && exam.time === other.time)
  );

  // Check for time conflicts - count overlapping sessions
  const timeConflictCount = (() => {
    let conflicts = 0;
    for (let i = 0; i < scheduledSessions.length; i++) {
      for (let j = i + 1; j < scheduledSessions.length; j++) {
        const s1 = scheduledSessions[i];
        const s2 = scheduledSessions[j];
        if (s1.day === s2.day && s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
          // Check week type
          if (s1.weekType === 'both' || s2.weekType === 'both' || s1.weekType === s2.weekType) {
            conflicts++;
          }
        }
      }
    }
    return conflicts;
  })();

  const hasTimeConflict = timeConflictCount > 0;
  const hasAnyConflict = hasTimeConflict || hasExamConflict;

  // Unit status
  const unitStatus = totalUnits < 12 ? 'low' : totalUnits > 20 ? 'high' : 'normal';

  // Conflict status display
  const getConflictStatus = () => {
    if (selectedCourses.length === 0) {
      return null;
    }
    if (hasTimeConflict) {
      return (
        <div className="flex items-center gap-1.5 text-destructive">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">
            {timeConflictCount} تداخل زمانی
          </span>
        </div>
      );
    }
    if (hasExamConflict) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">تداخل امتحان</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium">بدون تداخل</span>
      </div>
    );
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 border-t border-border bg-card/95 backdrop-blur-sm px-4 flex items-center justify-between z-40 shadow-lg">
      <div className="flex items-center gap-3">
        {/* Total Units - PROMINENT */}
        <div className="flex items-center gap-1.5">
          <span className={`
            text-lg font-bold tabular-nums
            ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}
          `}>
            {totalUnits}
          </span>
          <span className="text-[10px] text-muted-foreground">واحد</span>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Secondary Stats */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground">{selectedCourses.length}</span>
            <span className="text-[10px]">درس</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground">{activeDays}</span>
            <span className="text-[10px]">روز</span>
          </div>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Conflict Status - Integrated */}
        {getConflictStatus()}
      </div>

      <div className="text-[9px] text-muted-foreground">
        v1.0.0
      </div>
    </footer>
  );
};

export default Footer;
