import { CheckCircle2, AlertTriangle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import html2canvas from 'html2canvas';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ExamScheduleDialog from './ExamScheduleDialog';
import { toast } from 'sonner';

const Footer = () => {
  const { totalUnits, selectedCourses, scheduledSessions } = useSchedule();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadImage = async () => {
    const scheduleGrid = document.querySelector('[data-tour="schedule-grid"]');
    
    if (!scheduleGrid) {
      toast.error('جدول برنامه یافت نشد');
      return;
    }

    setIsDownloading(true);
    toast.loading('در حال آماده‌سازی تصویر...', { id: 'download' });

    try {
      const innerGrid = scheduleGrid.querySelector('.min-w-\\[900px\\]');
      const targetElement = (innerGrid || scheduleGrid) as HTMLElement;

      const canvas = await html2canvas(targetElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight,
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('خطا در ایجاد تصویر', { id: 'download' });
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        link.download = `golestoon-schedule-${dateStr}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('تصویر با موفقیت دانلود شد', { id: 'download' });
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error capturing schedule:', error);
      toast.error('خطا در ذخیره تصویر', { id: 'download' });
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
    <TooltipProvider delayDuration={200}>
      <footer className="fixed bottom-0 left-0 right-0 h-10 border-t border-border bg-card/95 backdrop-blur-sm px-4 flex items-center justify-between z-40 shadow-lg">
        {/* Left Section - Stats */}
        <div className="flex items-center gap-3">
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

          {getConflictStatus()}
        </div>

        {/* Center Section - Exam Schedule */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <ExamScheduleDialog />
        </div>

        {/* Right Section - Download & Version */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                data-tour="download-image"
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs gap-1"
                onClick={handleDownloadImage}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline text-[10px]">دانلود</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>دانلود تصویر برنامه</TooltipContent>
          </Tooltip>
          
          <div className="text-[9px] text-muted-foreground">
            v1.0.0
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
};

export default Footer;
