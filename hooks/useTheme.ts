import { useSettings } from '@/store/settings';
import { getThemeColors, ThemeColors } from '@/constants/colors';

export function useTheme() {
  const { darkMode } = useSettings();
  const colors = getThemeColors(darkMode);
  
  return {
    colors,
    isDark: darkMode,
  };
}