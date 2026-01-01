import { useState } from 'react';
import { History, Trash2, Download, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface SavedSchedule {
  id: string;
  name: string;
  courseIds: string[];
  createdAt: string;
}

const SavedSchedulesSheet = () => {
  const [schedules, setSchedules] = useState<SavedSchedule[]>([
    { id: '1', name: 'ترکیب ۱ - صبح', courseIds: ['1', '4'], createdAt: '۱۴۰۳/۰۹/۱۵' },
    { id: '2', name: 'ترکیب ۲ - عصر', courseIds: ['2', '3', '5'], createdAt: '۱۴۰۳/۰۹/۱۴' },
    { id: '3', name: 'پشتیبان', courseIds: ['1', '2', '4'], createdAt: '۱۴۰۳/۰۹/۱۲' },
  ]);
  const [newName, setNewName] = useState('');

  const handleLoad = (schedule: SavedSchedule) => {
    toast.success('برنامه بارگذاری شد', { description: schedule.name });
  };

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.info('برنامه حذف شد');
  };

  const handleSave = () => {
    if (!newName.trim()) {
      toast.error('لطفاً نام برنامه را وارد کنید');
      return;
    }
    const newSchedule: SavedSchedule = {
      id: Date.now().toString(),
      name: newName,
      courseIds: [],
      createdAt: '۱۴۰۳/۰۹/۱۶',
    };
    setSchedules(prev => [newSchedule, ...prev]);
    setNewName('');
    toast.success('برنامه ذخیره شد');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <History className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px]" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            برنامه‌های ذخیره شده
          </SheetTitle>
          <SheetDescription>
            ترکیب‌های برنامه خود را مدیریت کنید
          </SheetDescription>
        </SheetHeader>

        {/* Save New */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="نام برنامه جدید..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9 text-xs"
          />
          <Button size="sm" className="h-9 px-3" onClick={handleSave}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List */}
        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          <div className="space-y-2 pr-2">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id}
                className="p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{schedule.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {schedule.courseIds.length} درس • {schedule.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => handleLoad(schedule)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {schedules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                هیچ برنامه‌ای ذخیره نشده است
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SavedSchedulesSheet;
