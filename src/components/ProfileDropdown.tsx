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
import { useAuth } from '@/contexts/AuthContext';

const ProfileDropdown = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useSettings();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    t('کاربر مهمان', 'Guest User');

  const email = user?.email || 'guest@example.com';

  const initials =
    (displayName && displayName.trim()[0]?.toUpperCase()) || 'U';

  const handleLogout = async () => {
    await signOut();
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
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 text-right py-2 rounded-lg shadow-lg">
          <DropdownMenuLabel className="text-xs font-normal pb-1">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-[11px] text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setProfileOpen(true)}
            className="text-base gap-2 cursor-pointer py-2"
          >
            <User className="h-4 w-4" />
            {t('پروفایل دانشجو', 'Student Profile')}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setSettingsOpen(true)}
            className="text-base gap-2 cursor-pointer py-2"
          >
            <Settings className="h-4 w-4" />
            {t('تنظیمات', 'Settings')}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setTourOpen(true)}
            className="text-base gap-2 cursor-pointer py-2"
          >
            <HelpCircle className="h-4 w-4" />
            {t('راهنما', 'Guide')}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleAbout}
            className="text-base gap-2 cursor-pointer py-2"
          >
            <Info className="h-4 w-4" />
            {t('درباره', 'About')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-base gap-2 cursor-pointer py-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
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
