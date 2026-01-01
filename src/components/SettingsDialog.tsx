import { Settings, Sun, Moon, Monitor, Type, Grid3X3, Languages } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useSettings, FontSize, ThemeMode, Language } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const {
    fontSize,
    setFontSize,
    themeMode,
    setThemeMode,
    showGridLines,
    setShowGridLines,
    language,
    setLanguage,
    t,
  } = useSettings();

  const fontSizeOptions: { value: FontSize; label: string; labelEn: string }[] = [
    { value: 'small', label: 'کوچک', labelEn: 'Small' },
    { value: 'normal', label: 'معمولی', labelEn: 'Normal' },
    { value: 'large', label: 'بزرگ', labelEn: 'Large' },
  ];

  const themeModeOptions: { value: ThemeMode; label: string; labelEn: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'روشن', labelEn: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'تیره', labelEn: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'خودکار', labelEn: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            {t('تنظیمات برنامه', 'App Settings')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Section 1: Theme Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('حالت نمایش', 'Theme Mode')}</h3>
            </div>
            <RadioGroup
              value={themeMode}
              onValueChange={(val) => setThemeMode(val as ThemeMode)}
              className="grid grid-cols-3 gap-2"
            >
              {themeModeOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`theme-${option.value}`}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    themeMode === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={`theme-${option.value}`} className="sr-only" />
                  {option.icon}
                  <span className="text-xs">{t(option.label, option.labelEn)}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Section 2: Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('اندازه فونت', 'Font Size')}</h3>
            </div>
            <RadioGroup
              value={fontSize}
              onValueChange={(val) => setFontSize(val as FontSize)}
              className="grid grid-cols-3 gap-2"
            >
              {fontSizeOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`font-${option.value}`}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    fontSize === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={`font-${option.value}`} className="sr-only" />
                  <span className={cn(
                    option.value === 'small' && 'text-xs',
                    option.value === 'normal' && 'text-sm',
                    option.value === 'large' && 'text-base'
                  )}>
                    {t(option.label, option.labelEn)}
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {t('روی کارت دروس، لیست دروس و جدول زمان‌بندی اعمال می‌شود.', 'Applies to course cards, course list, and schedule grid.')}
            </p>
          </div>

          <Separator />

          {/* Section 3: Grid Lines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('نمایش خطوط جدول', 'Grid Lines')}</h3>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <Label htmlFor="grid-lines" className="text-sm cursor-pointer flex-1">
                {showGridLines
                  ? t('خطوط جدول نمایش داده می‌شوند', 'Grid lines are visible')
                  : t('ظاهر مینیمال (بدون خطوط)', 'Minimal appearance (no lines)')
                }
              </Label>
              <Switch
                id="grid-lines"
                checked={showGridLines}
                onCheckedChange={setShowGridLines}
              />
            </div>
          </div>

          <Separator />

          {/* Section 4: Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('زبان سایت', 'Site Language')}</h3>
            </div>
            <RadioGroup
              value={language}
              onValueChange={(val) => setLanguage(val as Language)}
              className="grid grid-cols-2 gap-2"
            >
              {languageOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`lang-${option.value}`}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    language === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={`lang-${option.value}`} className="sr-only" />
                  <span className="text-lg">{option.flag}</span>
                  <span className="text-sm">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
