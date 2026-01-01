import { BookOpen, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { DAYS } from '@/types/course';

const SidebarStats = () => {
  const { totalUnits, selectedCourses, scheduledSessions } = useSchedule();

  // Calculate active days
  const activeDays = new Set(scheduledSessions.map(s => s.day)).size;

  // Check for conflicts
  const hasAnyConflict = false; // Can be extended with real conflict detection

  // Unit status
  const unitStatus = totalUnits < 12 ? 'low' : totalUnits > 20 ? 'high' : 'normal';

  return (
    <div className="border-t border-border bg-card/95 backdrop-blur-sm p-3 shrink-0">
      <div className="grid grid-cols-4 gap-2">
        {/* Total Units - Most prominent */}
        <div className="text-center">
          <div className={`
            text-xl font-black
            ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}
          `}>
            {totalUnits}
          </div>
          <div className="text-[8px] text-muted-foreground mt-0.5">واحد</div>
        </div>

        {/* Course Count */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <BookOpen className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{selectedCourses.length}</span>
          </div>
          <div className="text-[8px] text-muted-foreground mt-0.5">درس</div>
        </div>

        {/* Active Days */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{activeDays}</span>
          </div>
          <div className="text-[8px] text-muted-foreground mt-0.5">روز</div>
        </div>

        {/* Status */}
        <div className="text-center">
          {hasAnyConflict ? (
            <>
              <AlertTriangle className="w-4 h-4 text-destructive mx-auto" />
              <div className="text-[8px] text-destructive mt-0.5">تداخل</div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
              <div className="text-[8px] text-emerald-600 mt-0.5">معتبر</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarStats;
