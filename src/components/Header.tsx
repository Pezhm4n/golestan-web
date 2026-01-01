import { Moon, Sun, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  return (
    <header className="h-[50px] border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      <h1 className="text-sm font-bold text-foreground">
        برنامه‌ریز گلستان
      </h1>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className="h-7 px-2 text-xs gap-1"
        >
          {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isDarkMode ? 'روشن' : 'تاریک'}</span>
        </Button>
        
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
          <Download className="h-3.5 w-3.5" />
          <span>خروجی</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;