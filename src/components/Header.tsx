import { Moon, Sun, Download, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ExamScheduleDialog from './ExamScheduleDialog';
import SavedSchedulesSheet from './SavedSchedulesSheet';
import ProfileDropdown from './ProfileDropdown';
import LanguageToggle from './LanguageToggle';
import { toast } from 'sonner';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
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
      // Find the inner grid container (the actual table, not the scroll wrapper)
      const innerGrid = scheduleGrid.querySelector('.min-w-\\[800px\\]');
      const targetElement = (innerGrid || scheduleGrid) as HTMLElement;

      // Read design tokens from CSS variables (so export matches theme)
      const rootStyles = getComputedStyle(document.documentElement);
      const hslVar = (varName: string, alpha = 1) => {
        const v = rootStyles.getPropertyValue(varName).trim();
        return v ? `hsl(${v} / ${alpha})` : '';
      };

      const bgColor = hslVar('--background', 1);
      const cardBg = hslVar('--card', 1);
      const textColor = hslVar('--foreground', 1);
      const mutedTextColor = hslVar('--muted-foreground', 1);
      const headerBg = hslVar('--muted', 0.8);
      const rowAltBg = hslVar('--muted', 0.1);
      const timeColBg = hslVar('--muted', 0.5);
      const gridLineColor = hslVar('--border', 0.9);

      // Note: Course colors are now dynamic via inline styles, no need for static mapping

      const canvas = await html2canvas(targetElement, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        logging: false,
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight,
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight,
        onclone: (clonedDoc, element) => {
          // Ensure colors are preserved
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          `;
          clonedDoc.head.appendChild(style);

          // Remove extra padding/margins so the exported image is tightly cropped
          element.style.margin = '0';
          element.style.padding = '0';
          element.style.borderRadius = '0';
          element.style.backgroundColor = cardBg;
          element.style.boxSizing = 'border-box';

          // Make grid lines clearly visible by force-styling the grid container's direct children
          Array.from(element.children).forEach((child) => {
            const el = child as HTMLElement;
            el.style.border = `1px solid ${gridLineColor}`;
            el.style.boxSizing = 'border-box';
          });

          // Fix course cell colors - apply explicit HSL colors
          // Course cells now use inline backgroundColor style, so we just enhance styling
          const courseCells = element.querySelectorAll('[style*="background-color: hsl"]');
          courseCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.padding = '6px 4px';
            htmlCell.style.borderRadius = '6px';
            htmlCell.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            htmlCell.style.borderRight = `3px solid ${isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)'}`;
          });

          // Fix cell backgrounds (bg-*) that rely on CSS vars/opacity
          const bgBackgroundCells = element.querySelectorAll('.bg-background');
          bgBackgroundCells.forEach((cell) => {
            (cell as HTMLElement).style.backgroundColor = bgColor;
          });

          const altCells = element.querySelectorAll('.bg-muted\\/10');
          altCells.forEach((cell) => {
            (cell as HTMLElement).style.backgroundColor = rowAltBg;
          });

          const timeCells = element.querySelectorAll('.bg-muted\\/50');
          timeCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.backgroundColor = timeColBg;
            htmlCell.style.color = mutedTextColor;
          });

          const headerCells = element.querySelectorAll('.bg-muted\\/80');
          headerCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.backgroundColor = headerBg;
            htmlCell.style.color = textColor;
          });

          // Fix text colors
          const allText = element.querySelectorAll('p, span, div');
          allText.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const classes = htmlEl.className || '';

            if (classes.includes('text-foreground')) htmlEl.style.color = textColor;
            if (
              classes.includes('text-muted-foreground') ||
              classes.includes('text-foreground/70') ||
              classes.includes('text-foreground/60')
            ) {
              htmlEl.style.color = mutedTextColor;
            }
          });

          // Remove truncate so text isn't clipped in the export
          const truncatedElements = element.querySelectorAll('.truncate');
          truncatedElements.forEach((el) => {
            el.classList.remove('truncate');
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.textOverflow = 'clip';
            (el as HTMLElement).style.whiteSpace = 'normal';
            (el as HTMLElement).style.wordBreak = 'break-word';
          });

          // Hide delete buttons
          const deleteButtons = element.querySelectorAll('button');
          deleteButtons.forEach((btn) => {
            (btn as HTMLElement).style.display = 'none';
          });

          // Make small text readable
          const fontElements = element.querySelectorAll('p, span');
          fontElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const currentSize = parseFloat(getComputedStyle(htmlEl).fontSize);
            if (currentSize < 10) htmlEl.style.fontSize = '10px';
            htmlEl.style.fontWeight = '500';
          });
        },
      });

      // Add watermark to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Watermark settings
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
        
        // Position at bottom-right corner
        const watermarkText = 'Golestoon';
        const textMetrics = ctx.measureText(watermarkText);
        const x = canvas.width - textMetrics.width - 30;
        const y = canvas.height - 25;
        
        ctx.fillText(watermarkText, x, y);
        ctx.restore();
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('خطا در ایجاد تصویر', { id: 'download' });
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with date
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

  return (
    <header className="h-[50px] border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-foreground">
          گلستون
        </h1>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          نیمسال ۱۴۰۳-۱
        </span>
      </div>
      
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1">
          {/* Donate Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/donate">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2.5 text-xs gap-1.5 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10 group"
                >
                  <Heart className="h-4 w-4 group-hover:animate-pulse group-hover:fill-pink-500" />
                  <span className="hidden sm:inline">حمایت</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>حمایت از ما 💙</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Saved Schedules - Icon + Text on desktop */}
          <SavedSchedulesSheet />

          <div className="w-px h-5 bg-border mx-1" />
          
          {/* Exam Schedule */}
          <ExamScheduleDialog />

          <div className="w-px h-5 bg-border mx-1" />
          
          {/* Language Toggle */}
          <LanguageToggle />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDarkMode}
                className="h-8 w-8 p-0"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDarkMode ? 'حالت روشن' : 'حالت تاریک'}</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                data-tour="download-image"
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs gap-1.5"
                onClick={handleDownloadImage}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">دانلود تصویر</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">دانلود تصویر</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Profile Dropdown */}
          <div data-tour="profile">
            <ProfileDropdown />
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
};

export default Header;
