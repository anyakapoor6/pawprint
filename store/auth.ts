import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photo?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Mock user data - used only for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '555-0123',
    photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
  },
  {
    id: '2',
    email: 'sarah@example.com',
    password: 'password123',
    name: 'Sarah Johnson',
    phone: '555-0124',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
  },
];

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  signIn: async (email, password) => {
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');

    const { password: _, ...userWithoutPassword } = user;
    await SecureStore.setItemAsync('user', JSON.stringify(userWithoutPassword));
    set({ user: userWithoutPassword });
  },

  signUp: async (email, password, name) => {
    if (MOCK_USERS.some(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email,
      name,
      photo: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
    };

    await SecureStore.setItemAsync('user', JSON.stringify(newUser));
    set({ user: newUser });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync('user');
    set({ user: null });
  },

  restoreSession: async () => {
    try {
      const userString = await SecureStore.getItemAsync('user');
      if (userString) {
        const user = JSON.parse(userString);
        set({ user });
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const currentUser = await SecureStore.getItemAsync('user');
      if (!currentUser) throw new Error('No user found');

      const user = JSON.parse(currentUser);
      const updatedUser = { ...user, ...updates };

      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },
}));
