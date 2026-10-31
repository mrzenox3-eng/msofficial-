import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'fintech' | 'dark' | 'light' | 'emerald' | 'sapphire' | 'amber' | 'gold' | 'silver' | 'diamond';

export interface ThemeOption {
  id: Theme;
  name: string;
  subtitle: string;
  accentColor: string;
  badge: string;
  canvasColor: string;
  cardColor: string;
  isLight: boolean;
  isOneMonthVipOnly?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'fintech',
    name: 'Liquid Glass Navy',
    subtitle: 'Midnight Navy (#07111F), Ocean Blue, Electric Blue & Aqua Cyan',
    accentColor: '#4DA3FF',
    badge: 'Liquid Glass',
    canvasColor: '#07111F',
    cardColor: '#0D1B2A',
    isLight: false,
  },
  {
    id: 'dark',
    name: 'Midnight Onyx',
    subtitle: 'Classic obsidian slate & emerald accents',
    accentColor: '#10b981',
    badge: 'Classic Dark',
    canvasColor: '#020617',
    cardColor: '#0f172a',
    isLight: false,
  },
  {
    id: 'light',
    name: 'Porcelain Clean',
    subtitle: 'Crisp porcelain white & high-contrast slate',
    accentColor: '#059669',
    badge: 'Clean Light',
    canvasColor: '#f8fafc',
    cardColor: '#ffffff',
    isLight: true,
  },
  {
    id: 'emerald',
    name: 'Royal Pine & Gold',
    subtitle: 'Imperial forest pine & gold luxury finish',
    accentColor: '#10b981',
    badge: 'Royal Green',
    canvasColor: '#041c14',
    cardColor: '#072a1e',
    isLight: false,
  },
  {
    id: 'sapphire',
    name: 'Cyber Sapphire',
    subtitle: 'Deep marine navy & neon cyan tech aesthetic',
    accentColor: '#06b6d4',
    badge: 'Tech Blue',
    canvasColor: '#030c1d',
    cardColor: '#071733',
    isLight: false,
  },
  {
    id: 'amber',
    name: 'Sunset Espresso',
    subtitle: 'Rich dark espresso & glowing champagne bronze',
    accentColor: '#f59e0b',
    badge: 'Warm Luxury',
    canvasColor: '#170e08',
    cardColor: '#24160e',
    isLight: false,
  },
  // ONE MONTH PACKAGE EXCLUSIVE VIP SKINS
  {
    id: 'gold',
    name: 'Midas Sovereign Gold',
    subtitle: 'Exclusive 24K Royal Gold & Amber Bronze for 1-Month VIP Members',
    accentColor: '#EAB308',
    badge: '👑 VIP Gold',
    canvasColor: '#120B02',
    cardColor: '#241706',
    isLight: false,
    isOneMonthVipOnly: true,
  },
  {
    id: 'silver',
    name: 'Platinum Titanium Silver',
    subtitle: 'Exclusive Pure Platinum Chrome & Frost Titanium for 1-Month VIP Members',
    accentColor: '#CBD5E1',
    badge: '🥈 VIP Silver',
    canvasColor: '#0B0F15',
    cardColor: '#161E29',
    isLight: false,
    isOneMonthVipOnly: true,
  },
  {
    id: 'diamond',
    name: 'Crystalline Cyan Diamond',
    subtitle: 'Exclusive Prismatic Azure & Radiant Diamond Cyan for 1-Month VIP Members',
    accentColor: '#06B6D4',
    badge: '💎 VIP Diamond',
    canvasColor: '#02121A',
    cardColor: '#052331',
    isLight: false,
    isOneMonthVipOnly: true,
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  isLight: boolean;
  activeThemeOption: ThemeOption;
  isThemePickerOpen: boolean;
  openThemePicker: () => void;
  closeThemePicker: () => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'ms_official_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as Theme;
      if (stored === 'light') {
        return 'light';
      }
    } catch {
      // ignore
    }
    return 'light'; // Porcelain Clean Light default theme
  });

  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const applyTheme = (currentTheme: Theme) => {
    const root = document.documentElement;
    // Remove previous theme classes
    root.classList.remove(
      'light',
      'dark',
      'theme-fintech',
      'theme-emerald',
      'theme-sapphire',
      'theme-amber',
      'theme-gold',
      'theme-silver',
      'theme-diamond'
    );

    // Add current theme attributes
    root.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark', `theme-${currentTheme}`);
      root.style.colorScheme = 'dark';
    }
  };

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const cycleTheme = () => {
    setThemeState((prev) => {
      const order: Theme[] = ['fintech', 'emerald', 'sapphire', 'gold', 'diamond', 'amber', 'silver', 'dark', 'light'];
      const currentIndex = order.indexOf(prev);
      const nextIndex = (currentIndex + 1) % order.length;
      return order[nextIndex];
    });
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'fintech' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const activeThemeOption =
    THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        toggleTheme,
        isLight: theme === 'light',
        activeThemeOption,
        isThemePickerOpen,
        openThemePicker: () => setIsThemePickerOpen(true),
        closeThemePicker: () => setIsThemePickerOpen(false),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
