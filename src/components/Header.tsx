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
        backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight,
        windowWidth: targetElement.scrollWidth + 100,
        windowHeight: targetElement.scrollHeight + 100,
        onclone: (clonedDoc, element) => {
          // Remove truncate class from all elements to show full text
          const truncatedElements = element.querySelectorAll('.truncate');
          truncatedElements.forEach((el) => {
            el.classList.remove('truncate');
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.textOverflow = 'clip';
            (el as HTMLElement).style.whiteSpace = 'normal';
            (el as HTMLElement).style.wordBreak = 'break-word';
          });

          // Make course cells larger to fit text
          const courseCells = element.querySelectorAll('[class*="bg-course-"]');
          courseCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.padding = '8px';
            htmlCell.style.fontSize = '12px';
          });

          // Increase font size for better readability
          const textElements = element.querySelectorAll('p, span');
          textElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const currentSize = parseFloat(getComputedStyle(htmlEl).fontSize);
            if (currentSize < 10) {
              htmlEl.style.fontSize = '10px';
            }
          });
        }
      });

      // Convert to blob and download

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
