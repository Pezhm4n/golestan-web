import { useState } from 'react';
import { Check, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterBase,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';

const SidebarActions = () => {
  const { selectedCourses, clearAll, saveSchedule } = useSchedule();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState('');

  const handleSaveClick = () => {
    if (selectedCourses.length === 0) {
      toast.info('برنامه خالی است');
      return;
    }
    setScheduleName('');
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    if (!scheduleName.trim()) {
      toast.error('لطفاً نام برنامه را وارد کنید');
      return;
    }
    saveSchedule(scheduleName.trim());
    setSaveDialogOpen(false);
  };

  const handleClearAll = () => {
    clearAll();
    toast.info('جدول پاک شد');
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-muted/30">
        {/* Primary Action - Save */}
        <Button
          variant="default"
          size="sm"
          className="flex-1 h-9 text-sm gap-2"
          onClick={handleSaveClick}
        >
          <Check className="h-4 w-4" />
          ذخیره برنامه
        </Button>

        {/* Secondary Actions in Dropdown */}
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer gap-2"
                  disabled={selectedCourses.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  پاک‌سازی جدول
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>پاک‌سازی جدول</AlertDialogTitle>
              <AlertDialogDescription>
                آیا مطمئن هستید؟ تمام دروس انتخاب شده از برنامه حذف خواهند شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooterBase className="gap-2">
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                پاک کردن
              </AlertDialogAction>
            </AlertDialogFooterBase>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ذخیره برنامه</DialogTitle>
            <DialogDescription className="text-xs">
              برای ذخیره ترکیب فعلی دروس، یک نام وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Input
              autoFocus
              placeholder="مثلاً برنامه اصلی صبح"
              value={scheduleName}
              onChange={e => setScheduleName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button size="sm" onClick={handleConfirmSave} className="gap-2">
              <Check className="h-4 w-4" />
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SidebarActions;
