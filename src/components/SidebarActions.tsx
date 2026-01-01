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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';

const SidebarActions = () => {
  const { selectedCourses, clearAll } = useSchedule();

  const handleSave = () => {
    if (selectedCourses.length === 0) {
      toast.info('برنامه خالی است');
      return;
    }
    toast.success('برنامه ذخیره شد', {
      description: `${selectedCourses.length} درس ذخیره شد`,
    });
  };

  const handleClearAll = () => {
    clearAll();
    toast.info('جدول پاک شد');
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-muted/30">
      {/* Primary Action - Save */}
      <Button 
        variant="default" 
        size="sm" 
        className="flex-1 h-9 text-sm gap-2"
        onClick={handleSave}
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
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              پاک کردن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SidebarActions;
