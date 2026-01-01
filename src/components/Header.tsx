import { Moon, Sun, Download, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
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

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  return (
    <header className="h-[50px] border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-foreground">
          برنامه‌ریز گلستان
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
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">دانلود تصویر</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">دانلود تصویر</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </TooltipProvider>
    </header>
  );
};

export default Header;
