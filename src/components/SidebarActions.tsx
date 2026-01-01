import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';

const SidebarActions = () => {
  const { selectedCourses, clearAll } = useSchedule();

  const handleSave = () => {
    toast.success('تغییرات ذخیره شد', {
      description: `${selectedCourses.length} درس ذخیره شد`,
    });
  };

  const handleClearAll = () => {
    if (selectedCourses.length === 0) {
      toast.info('برنامه خالی است');
      return;
    }
    clearAll();
    toast.info('تمام دروس حذف شدند');
  };

  return (
    <div className="flex items-center gap-1.5 p-2 border-b border-border/50 bg-muted/30">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 h-7 text-[10px] gap-1"
        onClick={handleSave}
      >
        <Save className="h-3 w-3" />
        ذخیره تغییرات
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleClearAll}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default SidebarActions;
