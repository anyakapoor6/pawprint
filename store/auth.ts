import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  phone?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateProfilePhoto: () => Promise<void>;
}

// Mock user data - in a real app, this would come from your backend
const MOCK_USERS = [
  {
    id: '1',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Doe',
    photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 (555) 123-4567',
    bio: 'Animal lover and pet rescue volunteer',
  },
  {
    id: '2',
    email: 'sarah@example.com',
    password: 'password123',
    name: 'Sarah Johnson',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 (555) 987-6543',
    bio: 'Dedicated to helping lost pets find their way home',
  },
];

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  signIn: async (email, password) => {
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    await SecureStore.setItemAsync('user', JSON.stringify(userWithoutPassword));
    set({ user: userWithoutPassword });
  },
  signUp: async (email, password, name) => {
    // Check if user already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email,
      name,
      photo: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
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
  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
  updateProfilePhoto: async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { 
          ...currentUser, 
          photo: result.assets[0].uri 
        };
        
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  },
}));