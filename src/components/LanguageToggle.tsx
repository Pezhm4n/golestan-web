import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 px-2 text-xs gap-1.5"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === 'fa' ? 'EN' : 'فا'}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
      </TooltipContent>
    </Tooltip>
  );
};

export default LanguageToggle;
