import { Moon, Sun, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ExamScheduleDialog from './ExamScheduleDialog';
import AutoPlannerDialog from './AutoPlannerDialog';
import SavedSchedulesSheet from './SavedSchedulesSheet';

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
          {/* Auto Planner */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span><AutoPlannerDialog /></span>
            </TooltipTrigger>
            <TooltipContent>انتخاب خودکار</TooltipContent>
          </Tooltip>

          {/* Saved Schedules */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span><SavedSchedulesSheet /></span>
            </TooltipTrigger>
            <TooltipContent>ترکیب‌های ذخیره شده</TooltipContent>
          </Tooltip>

          {/* Statistics */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>آمار</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />
          
          {/* Exam Schedule */}
          <ExamScheduleDialog />

          <div className="w-px h-5 bg-border mx-1" />
          
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
                <span>خروجی</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>دانلود برنامه</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-1" />

          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              کا
            </AvatarFallback>
          </Avatar>
        </div>
      </TooltipProvider>
    </header>
  );
};

export default Header;
