import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  togglePushNotifications: () => void;
  toggleEmailNotifications: () => void;
  toggleDarkMode: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      pushNotifications: true,
      emailNotifications: true,
      darkMode: false,
      
      togglePushNotifications: () => 
        set((state) => ({ pushNotifications: !state.pushNotifications })),
      
      toggleEmailNotifications: () => 
        set((state) => ({ emailNotifications: !state.emailNotifications })),
      
      toggleDarkMode: () => 
        set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);