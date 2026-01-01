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

      const canvas = await html2canvas(targetElement, {
        backgroundColor: isDarkMode ? '#1e1e2e' : '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false,
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight,
        windowWidth: targetElement.scrollWidth + 100,
        windowHeight: targetElement.scrollHeight + 100,
        onclone: (clonedDoc, element) => {
          // Set proper background for the entire grid
          element.style.backgroundColor = isDarkMode ? '#1e1e2e' : '#f8fafc';
          element.style.borderRadius = '12px';
          element.style.padding = '4px';
          
          // Fix all cell backgrounds - ensure no black backgrounds
          const allCells = element.querySelectorAll('div');
          allCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            const computedBg = getComputedStyle(htmlCell).backgroundColor;
            // If background is transparent or black, set proper color
            if (computedBg === 'rgba(0, 0, 0, 0)' || computedBg === 'transparent' || computedBg === 'rgb(0, 0, 0)') {
              htmlCell.style.backgroundColor = isDarkMode ? '#1e1e2e' : '#f8fafc';
            }
          });

          // Fix muted/alternating row backgrounds
          const mutedCells = element.querySelectorAll('.bg-muted\\/10, .bg-background, .bg-muted\\/50');
          mutedCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            if (isDarkMode) {
              htmlCell.style.backgroundColor = '#252536';
            } else {
              htmlCell.style.backgroundColor = '#f1f5f9';
            }
          });

          // Remove truncate class from all elements to show full text
          const truncatedElements = element.querySelectorAll('.truncate');
          truncatedElements.forEach((el) => {
            el.classList.remove('truncate');
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.textOverflow = 'clip';
            (el as HTMLElement).style.whiteSpace = 'normal';
            (el as HTMLElement).style.wordBreak = 'break-word';
          });

          // Make course cells stand out better
          const courseCells = element.querySelectorAll('[class*="bg-course-"]');
          courseCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.padding = '8px';
            htmlCell.style.borderRadius = '6px';
            htmlCell.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          });

          // Increase font size for better readability
          const textElements = element.querySelectorAll('p, span');
          textElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const currentSize = parseFloat(getComputedStyle(htmlEl).fontSize);
            if (currentSize < 10) {
              htmlEl.style.fontSize = '11px';
            }
          });

          // Fix header row background
          const headerCells = element.querySelectorAll('.bg-muted\\/80');
          headerCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.backgroundColor = isDarkMode ? '#2a2a3d' : '#e2e8f0';
          });
        }
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
