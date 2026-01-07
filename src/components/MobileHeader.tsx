import { Menu, Moon, Sun, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import SavedSchedulesSheet from './SavedSchedulesSheet';
import LanguageToggle from './LanguageToggle';
import ProfileDropdown from './ProfileDropdown';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/contexts/SettingsContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface MobileHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isTablet?: boolean;
}

const MobileHeader = ({ isDarkMode, onToggleDarkMode, isTablet = false }: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { toggleLanguage } = useSettings();
  const { user } = useAuth();

  const handleLanguageRowClick = () => {
    toggleLanguage();
  };

  const displayName =
    ((user?.user_metadata?.full_name as string | undefined) || user?.email || t('auth.guestUserName', 'Guest')) as string;

  const initials =
    (displayName && displayName.trim()[0]?.toUpperCase()) || 'U';

  return (
    <header className="h-[50px] border-b border-border bg-card/80 backdrop-blur-sm px-3 flex items-center justify-between shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-bold text-foreground">{t('header.appName')}</h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1">
        {/* Tablet: Show more actions inline with icons */}
        {isTablet && (
          <>
            <Link to="/donate">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </Link>
            <SavedSchedulesSheet />
            <LanguageToggle />
          </>
        )}

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className="h-9 w-9 p-0"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Hamburger Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-sm font-bold">{t('mobile.menuTitle')}</h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-4 space-y-3">
                {/* Donate - only show in menu for mobile */}
                {!isTablet && (
                  <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-sm gap-3 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                    >
                      <Heart className="h-5 w-5" />
                      {t('mobile.donate')}
                    </Button>
                  </Link>
                )}

                {/* Saved Schedules - only show in menu for mobile */}
                {!isTablet && (
                  <SavedSchedulesSheet
                    variant="menu"
                    onScheduleLoaded={() => setIsMenuOpen(false)}
                  />
                )}

                {/* Language Toggle - only show in menu for mobile */}
                {!isTablet && (
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg active:bg-muted/70"
                    onClick={handleLanguageRowClick}
                  >
                    <span className="text-sm">{t('mobile.language')}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <LanguageToggle />
                    </div>
                  </div>
                )}

                {/* Profile */}
                <ProfileDropdown
                  trigger={
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg active:bg-muted/70 w-full cursor-pointer">
                      <span className="text-sm">{t('mobile.profile')}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary flex items-center justify-center">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  }
                  onBeforeOpenTour={() => setIsMenuOpen(false)}
                />
              </div>

              {/* Menu Footer */}
              <div className="p-4 border-t border-border text-center">
                <span className="text-[10px] text-muted-foreground">
                  {t('mobile.version', { version: '1.0.0' })}
                </span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default MobileHeader;
