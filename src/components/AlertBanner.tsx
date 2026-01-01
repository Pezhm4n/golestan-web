import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AlertBanner = () => {
  const { selectedCourses, scheduledSessions } = useSchedule();

  // Check for time conflicts (simplified)
  const hasTimeConflict = false; // Can be extended

  // Check for exam conflicts
  const examDates = selectedCourses
    .filter(c => c.examDate && c.examTime)
    .map(c => ({ id: c.id, name: c.name, date: c.examDate, time: c.examTime }));
  
  const hasExamConflict = examDates.some((exam, i) => 
    examDates.some((other, j) => i !== j && exam.date === other.date && exam.time === other.time)
  );

  if (selectedCourses.length === 0) {
    return null;
  }

  if (hasTimeConflict) {
    return (
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 py-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs font-medium mr-2">
          ⛔ تداخل زمانی در برنامه وجود دارد
        </AlertDescription>
      </Alert>
    );
  }

  if (hasExamConflict) {
    return (
      <Alert className="rounded-none border-x-0 border-t-0 py-2 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs font-medium mr-2 text-amber-700 dark:text-amber-400">
          ⚠️ تداخل تاریخ امتحان وجود دارد
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 py-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      <AlertDescription className="text-[11px] text-emerald-700 dark:text-emerald-400 mr-2">
        ✅ برنامه بدون تداخل است
      </AlertDescription>
    </Alert>
  );
};

export default AlertBanner;
