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

      // Define actual colors for course blocks (CSS variables don't work in html2canvas)
      const courseColors = isDarkMode ? {
        blue: 'hsl(210, 60%, 35%)',
        green: 'hsl(150, 50%, 30%)',
        orange: 'hsl(30, 60%, 35%)',
        purple: 'hsl(270, 50%, 35%)',
        pink: 'hsl(330, 50%, 35%)',
        teal: 'hsl(180, 50%, 30%)',
      } : {
        blue: 'hsl(210, 80%, 85%)',
        green: 'hsl(150, 60%, 85%)',
        orange: 'hsl(30, 80%, 85%)',
        purple: 'hsl(270, 70%, 85%)',
        pink: 'hsl(330, 70%, 85%)',
        teal: 'hsl(180, 60%, 85%)',
      };

      const bgColor = isDarkMode ? '#171717' : '#f5f5f5';
      const cardBg = isDarkMode ? '#242424' : '#fafafa';
      const textColor = isDarkMode ? '#fafafa' : '#171717';
      const mutedTextColor = isDarkMode ? '#a3a3a3' : '#525252';
      const headerBg = isDarkMode ? '#2a2a3d' : '#e2e8f0';

      const canvas = await html2canvas(targetElement, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        logging: false,
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight,
        windowWidth: targetElement.scrollWidth + 100,
        windowHeight: targetElement.scrollHeight + 100,
        onclone: (clonedDoc, element) => {
          // Set proper background for the entire grid
          element.style.backgroundColor = bgColor;
          element.style.borderRadius = '12px';
          element.style.padding = '8px';
          
          // Fix all divs - ensure no transparent backgrounds
          const allDivs = element.querySelectorAll('div');
          allDivs.forEach((div) => {
            const htmlDiv = div as HTMLElement;
            const computedBg = getComputedStyle(htmlDiv).backgroundColor;
            if (computedBg === 'rgba(0, 0, 0, 0)' || computedBg === 'transparent') {
              htmlDiv.style.backgroundColor = 'transparent';
            }
          });

          // Fix course cell colors - apply actual HSL colors
          Object.entries(courseColors).forEach(([colorName, colorValue]) => {
            const cells = element.querySelectorAll(`.bg-course-${colorName}`);
            cells.forEach((cell) => {
              const htmlCell = cell as HTMLElement;
              htmlCell.style.backgroundColor = colorValue;
              htmlCell.style.padding = '6px 4px';
              htmlCell.style.borderRadius = '6px';
              htmlCell.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              htmlCell.style.borderRight = `3px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`;
            });
          });

          // Fix text colors
          const allText = element.querySelectorAll('p, span, div');
          allText.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const classes = htmlEl.className || '';
            
            // Fix main text
            if (classes.includes('text-foreground')) {
              htmlEl.style.color = textColor;
            }
            // Fix muted text
            if (classes.includes('text-muted-foreground') || classes.includes('text-foreground/70') || classes.includes('text-foreground/60')) {
              htmlEl.style.color = mutedTextColor;
            }
          });

          // Remove truncate class from all elements
          const truncatedElements = element.querySelectorAll('.truncate');
          truncatedElements.forEach((el) => {
            el.classList.remove('truncate');
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.textOverflow = 'clip';
            (el as HTMLElement).style.whiteSpace = 'normal';
            (el as HTMLElement).style.wordBreak = 'break-word';
          });

          // Fix muted/alternating row backgrounds
          const mutedCells = element.querySelectorAll('.bg-muted\\/10, .bg-background, .bg-muted\\/50');
          mutedCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.backgroundColor = isDarkMode ? '#1f1f1f' : '#f1f5f9';
          });

          // Fix header row background
          const headerCells = element.querySelectorAll('.bg-muted\\/80');
          headerCells.forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.backgroundColor = headerBg;
            htmlCell.style.color = textColor;
          });

          // Hide delete buttons
          const deleteButtons = element.querySelectorAll('button');
          deleteButtons.forEach((btn) => {
            (btn as HTMLElement).style.display = 'none';
          });

          // Increase font size for better readability
          const fontElements = element.querySelectorAll('p, span');
          fontElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const currentSize = parseFloat(getComputedStyle(htmlEl).fontSize);
            if (currentSize < 10) {
              htmlEl.style.fontSize = '10px';
            }
            // Make text bolder
            htmlEl.style.fontWeight = '500';
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
