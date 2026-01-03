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
import { useTranslation } from 'react-i18next';

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
  } = useSettings();
  const { t } = useTranslation();

  const fontSizeOptions: { value: FontSize; key: 'small' | 'normal' | 'large' }[] = [
    { value: 'small', key: 'small' },
    { value: 'normal', key: 'normal' },
    { value: 'large', key: 'large' },
  ];

  const themeModeOptions: { value: ThemeMode; key: 'light' | 'dark' | 'system'; icon: React.ReactNode }[] = [
    { value: 'light', key: 'light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', key: 'dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', key: 'system', icon: <Monitor className="h-4 w-4" /> },
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
            {t('settings.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Section 1: Theme Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('settings.themeSection')}</h3>
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
                    'flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                    themeMode === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem value={option.value} id={`theme-${option.value}`} className="sr-only" />
                  {option.icon}
                  <span className="text-xs">
                    {t(`settings.theme.${option.key}`)}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Section 2: Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('settings.fontSizeSection')}</h3>
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
                    'flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                    fontSize === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem value={option.value} id={`font-${option.value}`} className="sr-only" />
                  <span
                    className={cn(
                      option.value === 'small' && 'text-xs',
                      option.value === 'normal' && 'text-sm',
                      option.value === 'large' && 'text-base',
                    )}
                  >
                    {t(`settings.fontSize.${option.key}`)}
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {t('settings.fontSizeNote')}
            </p>
          </div>

          <Separator />

          {/* Section 3: Grid Lines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('settings.gridSection')}</h3>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <Label htmlFor="grid-lines" className="text-sm cursor-pointer flex-1">
                {showGridLines ? t('settings.gridOn') : t('settings.gridOff')}
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
              <h3 className="text-sm font-semibold">{t('settings.languageSection')}</h3>
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
                    'flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                    language === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50',
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
