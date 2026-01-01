import { Moon, Sun, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
      <h1 className="text-xl font-bold text-foreground">
        برنامه‌ریز گلستان
      </h1>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDarkMode}
          className="gap-2"
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4" />
              <span>حالت روشن</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>حالت تاریک</span>
            </>
          )}
        </Button>
        
        <Button variant="default" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span>خروجی</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
