import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender } from '@/types/course';
import { Clock, Users, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');

  return (
    <div
      className="p-3 border-b border-border bg-muted/30 space-y-3 text-[11px]"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Group 1: Time */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-medium">
            {t('filters.timeRange')}
          </span>
        </div>
        <div className="flex items-center gap-2 pr-4">
          <Select value={timeFrom.toString()} onValueChange={(v) => onTimeFromChange(Number(v))}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue placeholder={t('filters.from')} />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(tOpt => (
                <SelectItem key={tOpt} value={tOpt.toString()} className="text-[11px]">
                  {tOpt.toString().padStart(2, '0')}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-[10px]">
            {t('filters.to')}
          </span>
          <Select value={timeTo.toString()} onValueChange={(v) => onTimeToChange(Number(v))}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue placeholder={t('filters.to')} />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(tOpt => (
                <SelectItem key={tOpt} value={tOpt.toString()} className="text-[11px]">
                  {tOpt.toString().padStart(2, '0')}:00
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
          <span className="text-[10px] font-medium">
            {t('filters.gender')}
          </span>
        </div>
        <div className="pr-4">
          <RadioGroup 
            value={gender} 
            onValueChange={(v) => onGenderChange(v as Gender | 'all')}
            className="flex flex-wrap gap-x-3 gap-y-1"
          >
            {[
              { value: 'all', label: t('filters.gender_all') },
              { value: 'male', label: t('filters.gender_male') },
              { value: 'female', label: t('filters.gender_female') },
              { value: 'mixed', label: t('filters.gender_mixed') },
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
          <span className="text-[10px] font-medium">
            {t('addCourse.groupLabel')}
          </span>
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
              {t('filters.generalCoursesOnly')}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactFilterPanel;
