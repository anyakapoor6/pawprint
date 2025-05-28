import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  togglePushNotifications: () => void;
  toggleEmailNotifications: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      pushNotifications: true,
      emailNotifications: true,
      
      togglePushNotifications: () => 
        set((state) => ({ pushNotifications: !state.pushNotifications })),
      
      toggleEmailNotifications: () => 
        set((state) => ({ emailNotifications: !state.emailNotifications })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);