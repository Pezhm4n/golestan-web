import { useState } from 'react';
import { LogOut, User, Settings, HelpCircle, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import StudentProfileDialog from './StudentProfileDialog';
import GuidedTour from './GuidedTour';
import SettingsDialog from './SettingsDialog';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.info(t('از حساب کاربری خارج شدید', 'Logged out'));
  };

  const handleAbout = () => {
    navigate('/about');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <AvatarFallback className="text-xs bg-primary/10 text-primary flex items-center justify-center">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 text-right">
          <DropdownMenuLabel className="text-xs font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{t('کاربر مهمان', 'Guest User')}</p>
              <p className="text-xs text-muted-foreground">guest@example.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="text-xs gap-2 cursor-pointer">
            <User className="h-3.5 w-3.5" />
            {t('پروفایل دانشجو', 'Student Profile')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="text-xs gap-2 cursor-pointer">
            <Settings className="h-3.5 w-3.5" />
            {t('تنظیمات', 'Settings')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setTourOpen(true)} className="text-xs gap-2 cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            {t('راهنما', 'Guide')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleAbout} className="text-xs gap-2 cursor-pointer">
            <Info className="h-3.5 w-3.5" />
            {t('درباره', 'About')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('خروج', 'Logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StudentProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <GuidedTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};

export default ProfileDropdown;
