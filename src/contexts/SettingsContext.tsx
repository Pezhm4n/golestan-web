import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  isDarkMode: boolean; // Computed dark mode state
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (faText: string, enText: string) => string;
  
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
}

const defaultSettings: StoredSettings = {
  fontSize: 'normal',
  themeMode: 'dark',
  showGridLines: true,
  language: 'fa',
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(defaultSettings.fontSize);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultSettings.themeMode);
  const [showGridLines, setShowGridLinesState] = useState<boolean>(defaultSettings.showGridLines);
  const [language, setLanguageState] = useState<Language>(defaultSettings.language);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredSettings = JSON.parse(stored);
        setFontSizeState(parsed.fontSize || defaultSettings.fontSize);
        setThemeModeState(parsed.themeMode || defaultSettings.themeMode);
        setShowGridLinesState(parsed.showGridLines ?? defaultSettings.showGridLines);
        setLanguageState(parsed.language || defaultSettings.language);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((settings: Partial<StoredSettings>) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : defaultSettings;
      const updated = { ...parsed, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, []);

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
  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    saveSettings({ fontSize: size });
  }, [saveSettings]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    saveSettings({ themeMode: mode });
  }, [saveSettings]);

  const setShowGridLines = useCallback((show: boolean) => {
    setShowGridLinesState(show);
    saveSettings({ showGridLines: show });
  }, [saveSettings]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveSettings({ language: lang });
  }, [saveSettings]);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'fa' ? 'en' : 'fa';
    setLanguage(newLang);
  }, [language, setLanguage]);

  const t = useCallback((faText: string, enText: string) => {
    return language === 'fa' ? faText : enText;
  }, [language]);

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
