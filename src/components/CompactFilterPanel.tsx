import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender } from '@/types/course';
import { Clock, Users, GraduationCap } from 'lucide-react';

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
    <div className="p-3 border-b border-border bg-muted/30 space-y-3 text-[11px]">
      {/* Group 1: Time */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-medium">زمان</span>
        </div>
        <div className="flex items-center gap-2 pr-4">
          <Select value={timeFrom.toString()} onValueChange={(v) => onTimeFromChange(Number(v))}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(t => (
                <SelectItem key={t} value={t.toString()} className="text-[11px]">
                  {t.toString().padStart(2, '0')}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-[10px]">تا</span>
          <Select value={timeTo.toString()} onValueChange={(v) => onTimeToChange(Number(v))}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(t => (
                <SelectItem key={t} value={t.toString()} className="text-[11px]">
                  {t.toString().padStart(2, '0')}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Group 2: Audience/Gender */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span className="text-[10px] font-medium">مخاطب</span>
        </div>
        <div className="pr-4">
          <RadioGroup 
            value={gender} 
            onValueChange={(v) => onGenderChange(v as Gender | 'all')}
            className="flex flex-wrap gap-x-3 gap-y-1"
          >
            {[
              { value: 'all', label: 'همه' },
              { value: 'male', label: 'آقا' },
              { value: 'female', label: 'خانم' },
              { value: 'mixed', label: 'مختلط' },
            ].map(opt => (
              <div key={opt.value} className="flex items-center gap-1">
                <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} className="h-3 w-3" />
                <Label htmlFor={`gender-${opt.value}`} className="text-[10px] cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Group 3: Course Type */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <GraduationCap className="h-3 w-3" />
          <span className="text-[10px] font-medium">نوع درس</span>
        </div>
        <div className="flex items-center gap-4 pr-4">
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
    </div>
  );
};

export default CompactFilterPanel;
