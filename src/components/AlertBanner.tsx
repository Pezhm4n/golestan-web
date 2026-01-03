import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useTranslation } from 'react-i18next';

const AlertBanner = () => {
  const { selectedCourses } = useSchedule();
  const { t } = useTranslation();

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
      <div className="fixed bottom-12 left-0 right-0 z-30 bg-destructive/95 text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 backdrop-blur-sm">
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs font-medium">{t('alertBanner.timeConflict')}</span>
      </div>
    );
  }

  if (hasExamConflict) {
    return (
      <div className="fixed bottom-12 left-0 right-0 z-30 bg-amber-500/95 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-medium">{t('alertBanner.examConflict')}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-12 left-0 right-0 z-30 bg-emerald-500/90 text-emerald-950 px-4 py-1.5 flex items-center justify-center gap-2 backdrop-blur-sm">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="text-[11px] font-medium">{t('alertBanner.noConflict')}</span>
    </div>
  );
};

export default AlertBanner;
