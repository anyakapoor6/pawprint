export const lightColors = {
  primary: '#4A90E2',
  primaryLight: '#74B3FF',
  primaryDark: '#2E64A1',
  secondary: '#50C878',
  secondaryLight: '#7EE2A8',
  secondaryDark: '#2E8F4D',
  accent: '#FF9966',
  accentLight: '#FFBD9D',
  accentDark: '#E57A45',
  warning: '#FFCC00',
  error: '#FF6B6B',
  success: '#50C878',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  shadow: '#000000',
  white: '#FFFFFF',
  black: '#000000',
  urgent: '#FF4E50',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const darkColors = {
  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  primaryDark: '#2563EB',
  secondary: '#4ADE80',
  secondaryLight: '#86EFAC',
  secondaryDark: '#16A34A',
  accent: '#FB923C',
  accentLight: '#FDBA74',
  accentDark: '#EA580C',
  warning: '#FCD34D',
  error: '#F87171',
  success: '#4ADE80',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  border: '#374151',
  shadow: '#000000',
  white: '#FFFFFF',
  black: '#000000',
  urgent: '#EF4444',
  gray: {
    50: '#18181B',
    100: '#27272A',
    200: '#3F3F46',
    300: '#52525B',
    400: '#71717A',
    500: '#A1A1AA',
    600: '#D4D4D8',
    700: '#E4E4E7',
    800: '#F4F4F5',
    900: '#FAFAFA',
  },
};

// Create a type for our theme colors
export type ThemeColors = typeof lightColors;

// Export a helper to get the current theme colors
export const getThemeColors = (isDark: boolean): ThemeColors => 
  isDark ? darkColors : lightColors;

// For backward compatibility, export colors as lightColors
export const colors = lightColors;