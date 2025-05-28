import { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '@/store/settings';

const ThemeContext = createContext<{
  isDark: boolean;
}>({
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { darkMode, setSystemTheme } = useSettings();

  // Sync with system theme on mount
  useEffect(() => {
    setSystemTheme(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ isDark: darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}