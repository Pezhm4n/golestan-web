import { BookOpen, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { DAYS } from '@/types/course';

const Footer = () => {
  const { totalUnits, selectedCourses, scheduledSessions } = useSchedule();

  // Calculate active days
  const activeDays = new Set(scheduledSessions.map(s => s.day)).size;

  // Check for conflicts (simplified)
  const hasAnyConflict = false; // Can be extended with real conflict detection

  // Unit status
  const unitStatus = totalUnits < 12 ? 'low' : totalUnits > 20 ? 'high' : 'normal';

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-12 border-t border-border bg-card/95 backdrop-blur-sm px-6 flex items-center justify-between z-40 shadow-lg">
      <div className="flex items-center gap-6">
        {/* Total Units - Most prominent */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">تعداد واحد:</span>
          <span className={`
            text-xl font-black
            ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}
          `}>
            {totalUnits}
          </span>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Course Count */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">تعداد درس:</span>
          <span className="text-sm font-bold text-foreground">{selectedCourses.length}</span>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Active Days */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">روزهای فعال:</span>
          <span className="text-sm font-bold text-foreground">{activeDays}</span>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">وضعیت:</span>
          {hasAnyConflict ? (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">تداخل</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-bold">معتبر</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        نسخه ۱.۰.۰
      </div>
    </footer>
  );
};

export default Footer;