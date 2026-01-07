import { useState } from 'react';
import { History, Trash2, Download, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { useSchedule } from '@/contexts/ScheduleContext';

const formatJalaliDate = (timestamp: number): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleDateString('fa-IR');
  }
};

interface SavedSchedulesSheetProps {
  onScheduleLoaded?: () => void;
  variant?: 'icon' | 'menu';
}

const SavedSchedulesSheet = ({ onScheduleLoaded, variant = 'icon' }: SavedSchedulesSheetProps) => {
  const { savedSchedules, loadSchedule, deleteSchedule, saveSchedule, selectedCourses } = useSchedule();
  const [newName, setNewName] = useState('');
  const { t } = useTranslation();

  const handleLoad = (id: string) => {
    loadSchedule(id);
    if (onScheduleLoaded) {
      onScheduleLoaded();
    }
  };

  const handleDelete = (id: string) => {
    deleteSchedule(id);
  };

  const handleSave = () => {
    if (!newName.trim()) {
      toast.error(t('sidebar.saveSchedulePrompt'));
      return;
    }
    if (selectedCourses.length === 0) {
      toast.info(t('sidebar.saveScheduleEmpty'));
      return;
    }
    saveSchedule(newName.trim());
    setNewName('');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {variant === 'icon' ? (
          <Button
            data-tour="saved-schedules"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs"
          >
            <History className="h-4 w-4" />
            <span className="hidden md:inline">{t('savedSchedules.sheetTitle')}</span>
          </Button>
        ) : (
          <Button
            data-tour="saved-schedules"
            variant="ghost"
            className="w-full justify-start h-12 text-sm gap-3 bg-muted/50 hover:bg-muted/70"
          >
            <History className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {t('savedSchedules.sheetTitle')}
            </span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px]" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('savedSchedules.sheetTitle')}
          </SheetTitle>
          <SheetDescription>
            {t('savedSchedules.sheetSubtitle')}
          </SheetDescription>
        </SheetHeader>

        {/* Save New */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder={t('savedSchedules.newPlaceholder')}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="h-9 text-xs"
          />
          <Button size="sm" className="h-9 px-3" onClick={handleSave}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List */}
        <ScrollArea className="h-[calc(100vh-200px)] mt-4 touch-pan-y">
          <div className="space-y-2 pr-2">
            {savedSchedules.map(schedule => (
              <div
                key={schedule.id}
                className="p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{schedule.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {t('savedSchedules.savedAt', {
                        count: schedule.courses.length,
                        date: formatJalaliDate(schedule.createdAt),
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleLoad(schedule.id)}
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

            {savedSchedules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t('savedSchedules.emptyMessage')}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SavedSchedulesSheet;
