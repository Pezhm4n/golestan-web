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
import { useTranslation } from 'react-i18next';

interface FooterProps {
  isMobile?: boolean;
}

const Footer = ({ isMobile = false }: FooterProps) => {
  const { totalUnits, selectedCourses, scheduledSessions } = useSchedule();
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useTranslation();

  const handleDownloadImage = async () => {
    const scheduleGrid = document.querySelector('[data-tour="schedule-grid"]');
    
    if (!scheduleGrid) {
      toast.error(t('header.downloadImageError'));
      return;
    }

    setIsDownloading(true);
    toast.loading(t('header.downloadImagePreparing'), { id: 'download' });

    try {
      const scrollContainer = scheduleGrid.querySelector('.overflow-auto');
      const gridElement = scrollContainer?.firstElementChild as HTMLElement;
      
      if (!gridElement) {
        toast.error(t('header.downloadImageNotFound'), { id: 'download' });
        return;
      }

      const rootStyles = getComputedStyle(document.documentElement);
      const getHSL = (varName: string) => {
        const v = rootStyles.getPropertyValue(varName).trim();
        return v ? `hsl(${v})` : '#ffffff';
      };

      const bgColor = getHSL('--card');
      const textColor = getHSL('--foreground');
      const mutedColor = getHSL('--muted-foreground');
      const borderColor = getHSL('--border');
      const isDarkMode = document.documentElement.classList.contains('dark');

      const canvas = await html2canvas(gridElement, {
        backgroundColor: bgColor,
        scale: 2.5,
        useCORS: true,
        logging: false,
        width: gridElement.scrollWidth,
        height: gridElement.scrollHeight,
        windowWidth: gridElement.scrollWidth,
        windowHeight: gridElement.scrollHeight,
        onclone: (clonedDoc, clonedElement) => {
          // Ensure tight crop (no body margins) and anchor at top-left
          clonedDoc.documentElement.style.margin = '0';
          clonedDoc.documentElement.style.padding = '0';
          clonedDoc.documentElement.dir = 'rtl';
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          clonedDoc.body.style.backgroundColor = bgColor;
          clonedDoc.body.style.width = `${gridElement.scrollWidth}px`;
          clonedDoc.body.style.height = `${gridElement.scrollHeight}px`;
          clonedDoc.body.style.overflow = 'hidden';

          (clonedElement as HTMLElement).style.position = 'absolute';
          (clonedElement as HTMLElement).style.top = '0';
          (clonedElement as HTMLElement).style.left = '0';
          (clonedElement as HTMLElement).style.right = 'auto';
          (clonedElement as HTMLElement).style.transform = 'none';
          (clonedElement as HTMLElement).style.width = `${gridElement.scrollWidth}px`;
          (clonedElement as HTMLElement).style.height = `${gridElement.scrollHeight}px`;

          const style = clonedDoc.createElement('style');
          style.innerHTML = `* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`;
          clonedDoc.head.appendChild(style);

          clonedElement.style.padding = '0';
          clonedElement.style.margin = '0';
          clonedElement.style.backgroundColor = bgColor;
          clonedElement.style.border = `2px solid ${borderColor}`;

          // Hide buttons
          const buttons = clonedElement.querySelectorAll('button');
          buttons.forEach((btn) => (btn as HTMLElement).style.display = 'none');

          // Style header cells
          const headerCells = clonedElement.querySelectorAll('[class*="bg-muted/95"]');
          headerCells.forEach((cell) => {
            (cell as HTMLElement).style.backgroundColor = getHSL('--muted');
            (cell as HTMLElement).style.color = textColor;
          });

          // Style time cells
          const timeCells = clonedElement.querySelectorAll('[class*="bg-muted/60"]');
          timeCells.forEach((cell) => {
            (cell as HTMLElement).style.backgroundColor = getHSL('--muted');
            (cell as HTMLElement).style.color = mutedColor;
          });

          // Style course cells
          const courseCells = clonedElement.querySelectorAll('[style*="background-color"]');
          courseCells.forEach((cell) => {
            const el = cell as HTMLElement;
            el.style.padding = '8px';
            el.style.borderRadius = '8px';
            
            const title = el.querySelector('h3');
            if (title) {
              (title as HTMLElement).style.fontSize = '13px';
              (title as HTMLElement).style.fontWeight = '700';
            }
          });

          // Remove truncate
          const truncated = clonedElement.querySelectorAll('.truncate');
          truncated.forEach((el) => {
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.whiteSpace = 'normal';
          });
        },
      });

      // Add watermark
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)';
        const text = 'Golestoon';
        const metrics = ctx.measureText(text);
        ctx.fillText(text, canvas.width - metrics.width - 40, canvas.height - 30);
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error(t('header.downloadImageFailed'), { id: 'download' });
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

        toast.success(t('header.downloadImageSuccess'), { id: 'download' });
      }, 'image/png', 1.0);
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

  // Desktop Footer
  return (
    <TooltipProvider delayDuration={200}>
      <footer className="fixed bottom-0 left-0 right-0 h-12 border-t-2 border-border bg-card px-4 flex items-center justify-between z-40 shadow-xl">
        {/* Left Section - Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`
              text-lg font-bold tabular-nums
              ${unitStatus === 'low' ? 'text-amber-500' : unitStatus === 'high' ? 'text-destructive' : 'text-primary'}
            `}>
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

        {/* Center Section - Exam Schedule & Download */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Button 
            data-tour="download-image"
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs gap-1.5 border-primary/30 hover:bg-primary/10"
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
          
          <ExamScheduleDialog />
        </div>

        {/* Right Section - Version */}
        <div className="flex items-center">
          <div className="text-[10px] text-muted-foreground">
            {t('footer.version')}
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
};

export default Footer;
