import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import i18n from '@/i18n';

export type FontSize = 'small' | 'normal' | 'large';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'fa' | 'en';

interface SettingsContextType {
  // Appearance
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  showGridLines: boolean;
  setShowGridLines: (show: boolean) => void;
  isDarkMode: boolean;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  // Legacy helper (used in a few old places)
  t: (faText: string, enText: string) => string;

  // One‑time onboarding flags
  hasSeenConflictTip: boolean;
  markConflictTipAsSeen: () => void;

  // Helpers
  getFontSizeClass: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'golestan-settings';

interface StoredSettings {
  fontSize: FontSize;
  themeMode: ThemeMode;
  showGridLines: boolean;
  language: Language;
  /** One‑time flag: has the user seen the heavy‑conflict tip? */
  hasSeenConflictTip?: boolean;
  version?: number;
}

const SETTINGS_VERSION = 1;

const defaultSettings: StoredSettings = {
  fontSize: 'normal',
  themeMode: 'light',
  showGridLines: true,
  language: 'fa',
  hasSeenConflictTip: false,
  version: SETTINGS_VERSION,
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(defaultSettings.fontSize);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultSettings.themeMode);
  const [showGridLines, setShowGridLinesState] = useState<boolean>(defaultSettings.showGridLines);
  const [language, setLanguageState] = useState<Language>(defaultSettings.language);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [hasSeenConflictTip, setHasSeenConflictTip] = useState<boolean>(
    defaultSettings.hasSeenConflictTip ?? false,
  );

  // Save settings to localStorage
  const saveSettings = useCallback((settings: Partial<StoredSettings>) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed: StoredSettings = current ? JSON.parse(current) : defaultSettings;
      const updated: StoredSettings = {
        ...parsed,
        ...settings,
        version: SETTINGS_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, []);

  // Load settings from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredSettings = JSON.parse(stored);

        // If settings are from an older version, reset to new defaults
        if (!parsed.version || parsed.version !== SETTINGS_VERSION) {
          setFontSizeState(defaultSettings.fontSize);
          setThemeModeState(defaultSettings.themeMode);
          setShowGridLinesState(defaultSettings.showGridLines);
          setLanguageState(defaultSettings.language);
          saveSettings(defaultSettings);
          try {
            i18n.changeLanguage(defaultSettings.language);
          } catch (e) {
            console.error('Failed to change i18n language on load:', e);
          }
          if (typeof document !== 'undefined') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'fa';
          }
          return;
        }

        setFontSizeState(parsed.fontSize || defaultSettings.fontSize);
        setThemeModeState(parsed.themeMode || defaultSettings.themeMode);
        setShowGridLinesState(
          parsed.showGridLines ?? defaultSettings.showGridLines,
        );
        setLanguageState(parsed.language || defaultSettings.language);
        setHasSeenConflictTip(
          parsed.hasSeenConflictTip ?? defaultSettings.hasSeenConflictTip ?? false,
        );

        const lang = parsed.language || defaultSettings.language;
        try {
          i18n.changeLanguage(lang);
        } catch (e) {
          console.error('Failed to change i18n language on load:', e);
        }
        if (typeof document !== 'undefined') {
          const dir = lang === 'fa' ? 'rtl' : 'ltr';
          const htmlLang = lang === 'fa' ? 'fa' : 'en';
          document.documentElement.dir = dir;
          document.documentElement.lang = htmlLang;
        }
      } else {
        // No stored settings: default to Persian (fa) and light theme
        const defaultLang: Language = 'fa';
        setLanguageState(defaultLang);
        try {
          i18n.changeLanguage(defaultLang);
        } catch (e) {
          console.error('Failed to set default i18n language:', e);
        }
        if (typeof document !== 'undefined') {
          document.documentElement.dir = 'rtl';
          document.documentElement.lang = 'fa';
        }
        // Persist initial defaults with version
        saveSettings(defaultSettings);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, [saveSettings]);

  // Apply theme mode and track isDarkMode
  useEffect(() => {
    const root = document.documentElement;
    let dark = false;

    if (themeMode === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      dark = themeMode === 'dark';
    }

    root.classList.toggle('dark', dark);
    setIsDarkMode(dark);
  }, [themeMode]);

  // Setters with persistence
  const setFontSize = useCallback(
    (size: FontSize) => {
      setFontSizeState(size);
      saveSettings({ fontSize: size });
    },
    [saveSettings],
  );

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      saveSettings({ themeMode: mode });
    },
    [saveSettings],
  );

  const setShowGridLines = useCallback(
    (show: boolean) => {
      setShowGridLinesState(show);
      saveSettings({ showGridLines: show });
    },
    [saveSettings],
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      saveSettings({ language: lang });

      try {
        i18n.changeLanguage(lang);
      } catch (e) {
        console.error('Failed to change i18n language:', e);
      }

      if (typeof document !== 'undefined') {
        const dir = lang === 'fa' ? 'rtl' : 'ltr';
        const htmlLang = lang === 'fa' ? 'fa' : 'en';
        document.documentElement.dir = dir;
        document.documentElement.lang = htmlLang;
      }
    },
    [saveSettings],
  );

  const toggleLanguage = useCallback(() => {
    const newLang: Language = language === 'fa' ? 'en' : 'fa';
    setLanguage(newLang);
  }, [language, setLanguage]);

  // Legacy helper (used only in a couple of places)
  const t = useCallback(
    (faText: string, enText: string) => {
      return language === 'fa' ? faText : enText;
    },
    [language],
  );

  const getFontSizeClass = useCallback(() => {
    switch (fontSize) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  }, [fontSize]);

  const markConflictTipAsSeen = useCallback(() => {
    setHasSeenConflictTip(true);
    saveSettings({ hasSeenConflictTip: true });
  }, [saveSettings]);

  const value: SettingsContextType = {
    fontSize,
    setFontSize,
    themeMode,
    setThemeMode,
    showGridLines,
    setShowGridLines,
    isDarkMode,
    language,
    setLanguage,
    toggleLanguage,
    t,
    hasSeenConflictTip,
    markConflictTipAsSeen,
    getFontSizeClass,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
