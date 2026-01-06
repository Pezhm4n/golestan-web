import { CheckCircle2, AlertTriangle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { downloadScheduleImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ExamScheduleDialog from './ExamScheduleDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  isMobile?: boolean;
}

const Footer = ({ isMobile = false }: FooterProps) => {
  const { totalUnits, selectedCourses, scheduledSessions } = useSchedule();
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useTranslation();

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    toast.loading(t('header.downloadImagePreparing'), { id: 'download' });

    try {
      await downloadScheduleImage('schedule-grid-capture');
      toast.success(t('header.downloadImageSuccess'), { id: 'download' });
    } catch (error) {
      console.error('Error capturing schedule:', error);
      toast.error(t('header.downloadImageFailed'), { id: 'download' });
    } finally {
      setIsDownloading(false);
    }
  };

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
        const s1Start = Number(s1.startTime);
        const s1End = Number(s1.endTime);
        const s2Start = Number(s2.startTime);
        const s2End = Number(s2.endTime);

        if (s1.day === s2.day && s1Start < s2End && s2Start < s1End) {
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
            {t('footer.timeConflicts', { count: timeConflictCount })}
          </span>
        </div>
      );
    }
    if (hasExamConflict) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{t('footer.examConflict')}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium">{t('footer.noConflicts')}</span>
      </div>
    );
  };

  // Mobile Footer - Simplified (no tooltips for touch)
  if (isMobile) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 h-14 border-t-2 border-border bg-card px-3 flex items-center justify-between z-40 shadow-xl">
        {/* Left - Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className={`text-base font-bold tabular-nums ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}`}>
              {totalUnits}
            </span>
            <span className="text-[9px] text-muted-foreground">{t('footer.units')}</span>
          </div>
          
          <div className="w-px h-5 bg-border" />
          
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground">{selectedCourses.length}</span>
            <span className="text-[9px] text-muted-foreground">{t('footer.courses')}</span>
          </div>
          
          {hasAnyConflict && (
            <>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px]">{timeConflictCount}</span>
              </div>
            </>
          )}
        </div>

        {/* Right - Actions (no tooltips) */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 w-10 p-0"
            onClick={handleDownloadImage}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          
          <ExamScheduleDialog />
          
          {/* Status indicator */}
          {!hasAnyConflict && selectedCourses.length > 0 && (
            <div className="flex items-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>
      </footer>
    );
  }

  // Desktop Footer + Floating Action Bar
  return (
    <TooltipProvider delayDuration={200}>
      <>
        {/* Fixed footer for stats & version */}
        <footer className="fixed bottom-0 left-0 right-0 h-12 border-t-2 border-border bg-card/95 px-4 flex items-center justify-between z-40 shadow-xl">
          {/* Left Section - Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className={`
                text-lg font-bold tabular-nums
                ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}
              `}
              >
                {totalUnits}
              </span>
              <span className="text-[10px] text-muted-foreground">{t('footer.units')}</span>
            </div>

            <div className="w-px h-5 bg-border" />

            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-foreground">{selectedCourses.length}</span>
                <span className="text-[10px]">{t('footer.courses')}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-foreground">{activeDays}</span>
                <span className="text-[10px]">{t('footer.days')}</span>
              </div>
            </div>

            <div className="w-px h-5 bg-border" />

            {getConflictStatus()}
          </div>

          {/* Right Section - Version */}
          <div className="flex items-center">
            <div className="text-[10px] text-muted-foreground">
              {t('footer.version')}
            </div>
          </div>
        </footer>

        {/* Floating Action Bar - always accessible exam/download actions */}
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/85 backdrop-blur-md px-5 py-2.5 shadow-2xl">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-tour="download-image"
                  variant="outline"
                  size="default"
                  className="h-9 px-4 text-sm gap-2 border-primary/40 bg-background/70 hover:bg-primary/10"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{t('footer.downloadImage')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="text-[11px]" dir="rtl">
                {t('footer.downloadImage')}
              </TooltipContent>
            </Tooltip>

            <ExamScheduleDialog />
          </div>
        </div>
      </>
    </TooltipProvider>
  );
};

export default Footer;
