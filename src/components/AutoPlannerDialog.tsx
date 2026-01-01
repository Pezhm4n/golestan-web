import { Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

const AutoPlannerDialog = () => {
  const [minUnits, setMinUnits] = useState([12]);
  const [maxUnits, setMaxUnits] = useState([20]);
  const [preferMorning, setPreferMorning] = useState(false);
  const [avoidFriday, setAvoidFriday] = useState(true);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Wand2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            ایجاد برنامه خودکار
          </DialogTitle>
          <DialogDescription>
            تنظیمات خود را انتخاب کنید تا بهترین برنامه برای شما ساخته شود
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Units Range */}
          <div className="space-y-3">
            <Label className="text-sm">محدوده واحد: {minUnits[0]} - {maxUnits[0]}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">حداقل</span>
                <Slider
                  value={minUnits}
                  onValueChange={setMinUnits}
                  min={12}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">حداکثر</span>
                <Slider
                  value={maxUnits}
                  onValueChange={setMaxUnits}
                  min={14}
                  max={24}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <Label className="text-sm">ترجیحات</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="morning" 
                  checked={preferMorning}
                  onCheckedChange={(c) => setPreferMorning(!!c)}
                />
                <label htmlFor="morning" className="text-xs cursor-pointer">
                  ترجیح کلاس‌های صبح
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="friday" 
                  checked={avoidFriday}
                  onCheckedChange={(c) => setAvoidFriday(!!c)}
                />
                <label htmlFor="friday" className="text-xs cursor-pointer">
                  اجتناب از کلاس جمعه
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm">انصراف</Button>
          <Button size="sm" className="gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            ایجاد برنامه
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoPlannerDialog;
