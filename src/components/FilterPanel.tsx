import { Gender } from '@/types/course';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface FilterPanelProps {
  timeFrom: number;
  timeTo: number;
  gender: Gender | 'all';
  showGeneralOnly: boolean;
  hideFull: boolean;
  onTimeFromChange: (value: number) => void;
  onTimeToChange: (value: number) => void;
  onGenderChange: (value: Gender | 'all') => void;
  onShowGeneralOnlyChange: (value: boolean) => void;
  onHideFullChange: (value: boolean) => void;
}

const timeOptions = Array.from({ length: 14 }, (_, i) => ({
  value: 7 + i,
  label: `${(7 + i).toString().padStart(2, '0')}:۰۰`
}));

const FilterPanel = ({
  timeFrom,
  timeTo,
  gender,
  showGeneralOnly,
  hideFull,
  onTimeFromChange,
  onTimeToChange,
  onGenderChange,
  onShowGeneralOnlyChange,
  onHideFullChange
}: FilterPanelProps) => {
  return (
    <div className="space-y-4 p-3 bg-muted/30 rounded-lg border border-border">
      {/* Time Range */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">بازه زمانی</Label>
        <div className="flex items-center gap-2">
          <Select value={timeFrom.toString()} onValueChange={(v) => onTimeFromChange(parseInt(v))}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="از" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value.toString()} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">تا</span>
          <Select value={timeTo.toString()} onValueChange={(v) => onTimeToChange(parseInt(v))}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="تا" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value.toString()} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Gender Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">جنسیت</Label>
        <RadioGroup 
          value={gender} 
          onValueChange={(v) => onGenderChange(v as Gender | 'all')}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-1 space-x-reverse">
            <RadioGroupItem value="all" id="gender-all" className="h-3 w-3" />
            <Label htmlFor="gender-all" className="text-xs cursor-pointer">همه</Label>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <RadioGroupItem value="male" id="gender-male" className="h-3 w-3" />
            <Label htmlFor="gender-male" className="text-xs cursor-pointer">آقایان</Label>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <RadioGroupItem value="female" id="gender-female" className="h-3 w-3" />
            <Label htmlFor="gender-female" className="text-xs cursor-pointer">خانم‌ها</Label>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <RadioGroupItem value="mixed" id="gender-mixed" className="h-3 w-3" />
            <Label htmlFor="gender-mixed" className="text-xs cursor-pointer">مختلط</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="general-only" className="text-xs cursor-pointer">
            فقط دروس عمومی
          </Label>
          <Switch 
            id="general-only" 
            checked={showGeneralOnly} 
            onCheckedChange={onShowGeneralOnlyChange}
            className="h-4 w-7"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="hide-full" className="text-xs cursor-pointer">
            مخفی کردن دروس پر
          </Label>
          <Switch 
            id="hide-full" 
            checked={hideFull} 
            onCheckedChange={onHideFullChange}
            className="h-4 w-7"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
