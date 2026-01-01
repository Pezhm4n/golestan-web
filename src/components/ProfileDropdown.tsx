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

const ProfileDropdown = () => {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    toast.info('از حساب کاربری خارج شدید');
  };

  const handleSettings = () => {
    toast.info('تنظیمات در حال توسعه است');
  };

  const handleHelp = () => {
    toast.info('راهنما در حال توسعه است');
  };

  const handleAbout = () => {
    toast.info('نسخه ۱.۰.۰ - برنامه‌ریز گلستان');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              کا
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 text-right">
          <DropdownMenuLabel className="text-xs font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">کاربر مهمان</p>
              <p className="text-xs text-muted-foreground">guest@example.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="text-xs gap-2 cursor-pointer">
            <User className="h-3.5 w-3.5" />
            پروفایل دانشجو
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSettings} className="text-xs gap-2 cursor-pointer">
            <Settings className="h-3.5 w-3.5" />
            تنظیمات
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleHelp} className="text-xs gap-2 cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            راهنما
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleAbout} className="text-xs gap-2 cursor-pointer">
            <Info className="h-3.5 w-3.5" />
            درباره
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            خروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StudentProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};

export default ProfileDropdown;
