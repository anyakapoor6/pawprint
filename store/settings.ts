import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  useSystemTheme: boolean;
  togglePushNotifications: () => void;
  toggleEmailNotifications: () => void;
  toggleDarkMode: () => void;
  toggleUseSystemTheme: () => void;
  setSystemTheme: (isDark: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      pushNotifications: true,
      emailNotifications: true,
      darkMode: false,
      useSystemTheme: true,
      
      togglePushNotifications: () => 
        set((state) => ({ pushNotifications: !state.pushNotifications })),
      
      toggleEmailNotifications: () => 
        set((state) => ({ emailNotifications: !state.emailNotifications })),
      
      toggleDarkMode: () => 
        set((state) => ({ 
          darkMode: !state.darkMode,
          useSystemTheme: false, // Disable system theme when manually toggling
        })),

      toggleUseSystemTheme: () =>
        set((state) => ({ useSystemTheme: !state.useSystemTheme })),

      setSystemTheme: (isDark: boolean) =>
        set((state) => ({
          darkMode: state.useSystemTheme ? isDark : state.darkMode,
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);