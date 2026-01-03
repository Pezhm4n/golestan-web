import { Moon, Sun, Heart } from 'lucide-react';
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
import SavedSchedulesSheet from './SavedSchedulesSheet';
import ProfileDropdown from './ProfileDropdown';
import LanguageToggle from './LanguageToggle';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/use-responsive';
import MobileHeader from './MobileHeader';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  // Use mobile header for mobile and tablet devices
  if (isMobile || isTablet) {
    return <MobileHeader isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} isTablet={isTablet} />;
  }

  const handleDownloadImage = async () => {
    const scheduleGrid = document.querySelector('[data-tour="schedule-grid"]');
    
    if (!scheduleGrid) {
      toast.error('جدول برنامه یافت نشد');
      return;
    }

    setIsDownloading(true);
    toast.loading('در حال آماده‌سازی تصویر...', { id: 'download' });

    try {
      // Find the actual grid (the div with display: grid)
      const scrollContainer = scheduleGrid.querySelector('.overflow-auto');
      const gridElement = scrollContainer?.firstElementChild as HTMLElement;
      
      if (!gridElement) {
        toast.error('جدول یافت نشد', { id: 'download' });
        return;
      }

      // Get computed styles
      const rootStyles = getComputedStyle(document.documentElement);
      const getHSL = (varName: string) => {
        const v = rootStyles.getPropertyValue(varName).trim();
        return v ? `hsl(${v})` : '#ffffff';
      };

      const bgColor = getHSL('--card');
      const textColor = getHSL('--foreground');
      const mutedColor = getHSL('--muted-foreground');
      const borderColor = getHSL('--border');

      const canvas = await html2canvas(gridElement, {
        backgroundColor: bgColor,
        scale: 2.5,
        useCORS: true,
        logging: false,
        width: gridElement.scrollWidth,
        height: gridElement.scrollHeight,
        windowWidth: gridElement.scrollWidth,
        windowHeight: gridElement.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
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

          // Add print styles
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Style the cloned grid element
          clonedElement.style.padding = '0';
          clonedElement.style.margin = '0';
          clonedElement.style.backgroundColor = bgColor;
          clonedElement.style.borderRadius = '0';
          clonedElement.style.border = `2px solid ${borderColor}`;

          // Hide all delete buttons
          const buttons = clonedElement.querySelectorAll('button');
          buttons.forEach((btn) => {
            (btn as HTMLElement).style.display = 'none';
          });

          // Style header cells (bg-muted/95)
          const headerCells = clonedElement.querySelectorAll('[class*="bg-muted/95"], [class*="bg-muted\\/95"]');
          headerCells.forEach((cell) => {
            const el = cell as HTMLElement;
            el.style.backgroundColor = getHSL('--muted');
            el.style.color = textColor;
          });

          // Style time column cells
          const timeCells = clonedElement.querySelectorAll('[class*="bg-muted/60"], [class*="bg-muted\\/60"]');
          timeCells.forEach((cell) => {
            const el = cell as HTMLElement;
            el.style.backgroundColor = getHSL('--muted');
            el.style.color = mutedColor;
          });

          // Style alternating row cells
          const bgCells = clonedElement.querySelectorAll('[class*="bg-background"]');
          bgCells.forEach((cell) => {
            (cell as HTMLElement).style.backgroundColor = bgColor;
          });

          const altCells = clonedElement.querySelectorAll('[class*="bg-muted/10"], [class*="bg-muted\\/10"]');
          altCells.forEach((cell) => {
            const el = cell as HTMLElement;
            el.style.backgroundColor = isDarkMode ? 'hsl(0 0% 15%)' : 'hsl(0 0% 97%)';
          });

          // Make text more readable
          const allTextElements = clonedElement.querySelectorAll('h3, p, span, div');
          allTextElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const classes = htmlEl.className || '';
            
            // Set minimum font size for readability
            const fontSize = parseFloat(getComputedStyle(htmlEl).fontSize);
            if (fontSize < 11) {
              htmlEl.style.fontSize = '11px';
            }

            // Ensure text is visible
            if (classes.includes('text-gray-900')) {
              htmlEl.style.color = '#1a1a1a';
            }
            if (classes.includes('text-gray-700')) {
              htmlEl.style.color = '#374151';
            }
            if (classes.includes('text-gray-800')) {
              htmlEl.style.color = '#1f2937';
            }
            if (classes.includes('text-foreground')) {
              htmlEl.style.color = textColor;
            }
            if (classes.includes('text-muted-foreground')) {
              htmlEl.style.color = mutedColor;
            }
          });

          // Style course cells - ensure they have proper padding and are readable
          const courseCells = clonedElement.querySelectorAll('[style*="background-color"]');
          courseCells.forEach((cell) => {
            const el = cell as HTMLElement;
            el.style.padding = '8px';
            el.style.borderRadius = '8px';
            el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
            
            // Make inner text more readable
            const title = el.querySelector('h3');
            if (title) {
              (title as HTMLElement).style.fontSize = '13px';
              (title as HTMLElement).style.fontWeight = '700';
              (title as HTMLElement).style.marginBottom = '4px';
              (title as HTMLElement).style.overflow = 'visible';
              (title as HTMLElement).style.textOverflow = 'clip';
              (title as HTMLElement).style.whiteSpace = 'normal';
            }
            
            const instructor = el.querySelector('p');
            if (instructor) {
              (instructor as HTMLElement).style.fontSize = '11px';
              (instructor as HTMLElement).style.marginBottom = '4px';
              (instructor as HTMLElement).style.overflow = 'visible';
              (instructor as HTMLElement).style.textOverflow = 'clip';
              (instructor as HTMLElement).style.whiteSpace = 'normal';
            }
            
            // Style badges
            const badges = el.querySelectorAll('span');
            badges.forEach((badge) => {
              (badge as HTMLElement).style.fontSize = '10px';
              (badge as HTMLElement).style.padding = '2px 6px';
            });
          });

          // Remove truncate class effects
          const truncated = clonedElement.querySelectorAll('.truncate');
          truncated.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.overflow = 'visible';
            htmlEl.style.textOverflow = 'clip';
            htmlEl.style.whiteSpace = 'normal';
          });
        },
      });

      // Add watermark
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)';
        const text = 'Golestoon';
        const metrics = ctx.measureText(text);
        ctx.fillText(text, canvas.width - metrics.width - 40, canvas.height - 30);
        ctx.restore();
      }

      // Download
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

  return (
    <header className="h-[50px] border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-foreground">
          گلستون
        </h1>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          نیمسال 1403-1
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
