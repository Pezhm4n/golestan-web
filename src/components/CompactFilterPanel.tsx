import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender } from '@/types/course';

interface CompactFilterPanelProps {
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

const timeOptions = Array.from({ length: 14 }, (_, i) => 7 + i);

const CompactFilterPanel = ({
  timeFrom,
  timeTo,
  gender,
  showGeneralOnly,
  hideFull,
  onTimeFromChange,
  onTimeToChange,
  onGenderChange,
  onShowGeneralOnlyChange,
  onHideFullChange,
}: CompactFilterPanelProps) => {
  return (
    <div className="p-2 border-b border-border bg-muted/30 space-y-2 text-[11px]">
      {/* Time Range */}
      <div className="flex items-center gap-2">
        <Label className="text-[10px] text-muted-foreground shrink-0">ساعت:</Label>
        <Select value={timeFrom.toString()} onValueChange={(v) => onTimeFromChange(Number(v))}>
          <SelectTrigger className="h-6 text-[10px] flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map(t => (
              <SelectItem key={t} value={t.toString()} className="text-[11px]">
                {t.toString().padStart(2, '0')}:۰۰
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">تا</span>
        <Select value={timeTo.toString()} onValueChange={(v) => onTimeToChange(Number(v))}>
          <SelectTrigger className="h-6 text-[10px] flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map(t => (
              <SelectItem key={t} value={t.toString()} className="text-[11px]">
                {t.toString().padStart(2, '0')}:۰۰
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender Filter */}
      <div className="flex items-center gap-2">
        <Label className="text-[10px] text-muted-foreground shrink-0">جنسیت:</Label>
        <RadioGroup 
          value={gender} 
          onValueChange={(v) => onGenderChange(v as Gender | 'all')}
          className="flex gap-2"
        >
          {[
            { value: 'all', label: 'همه' },
            { value: 'male', label: 'برادران' },
            { value: 'female', label: 'خواهران' },
            { value: 'mixed', label: 'مختلط' },
          ].map(opt => (
            <div key={opt.value} className="flex items-center gap-0.5">
              <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} className="h-3 w-3" />
              <Label htmlFor={`gender-${opt.value}`} className="text-[10px] cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Checkbox
            id="general-only"
            checked={showGeneralOnly}
            onCheckedChange={(checked) => onShowGeneralOnlyChange(checked === true)}
            className="h-3 w-3"
          />
          <Label htmlFor="general-only" className="text-[10px] cursor-pointer">
            فقط عمومی
          </Label>
        </div>
        <div className="flex items-center gap-1">
          <Checkbox
            id="hide-full"
            checked={hideFull}
            onCheckedChange={(checked) => onHideFullChange(checked === true)}
            className="h-3 w-3"
          />
          <Label htmlFor="hide-full" className="text-[10px] cursor-pointer">
            مخفی کردن پر
          </Label>
        </div>
      </div>
    </div>
  );
};

export default CompactFilterPanel;