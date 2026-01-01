import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
      <div className="flex items-center gap-4">
        {/* Status - PRIMARY (Most Important) */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
          {hasAnyConflict ? (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">تداخل</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-bold">برنامه معتبر</span>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Total Units - PROMINENT */}
        <div className="flex items-center gap-2">
          <span className={`
            text-2xl font-black tabular-nums
            ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}
          `}>
            {totalUnits}
          </span>
          <span className="text-xs text-muted-foreground">واحد</span>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Secondary Stats */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">{selectedCourses.length}</span>
            <span className="text-[11px]">درس</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">{activeDays}</span>
            <span className="text-[11px]">روز فعال</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        نسخه ۱.۰.۰
      </div>
    </footer>
  );
};

export default Footer;
