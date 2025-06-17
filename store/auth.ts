import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { signOut as signOutUser, getUserProfile, updateUserProfile } from '@/lib/user';

interface User {
  id: string;
  name: string;
  email: string;
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

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned from sign in');

      // Get user profile
      const { data: profile, error: profileError } = await getUserProfile(user.id);
      if (profileError) throw profileError;
      if (!profile) throw new Error('No profile found');

      set({
        user: {
          id: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          photo: profile.photo_url,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned from sign up');

      // Create initial profile
      const { error: profileError } = await updateUserProfile(user.id, {
        name,
        email,
      });

      if (profileError) throw profileError;

      set({
        user: {
          id: user.id,
          name,
          email,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { success, error } = await signOutUser();
      if (error) throw error;

      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  restoreSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const { data: profile, error: profileError } = await getUserProfile(session.user.id);
        if (profileError) throw profileError;
        if (!profile) throw new Error('No profile found');

        set({
          user: {
            id: session.user.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            photo: profile.photo_url,
          },
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      set({ user: null, isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      const { data: profile, error } = await updateUserProfile(user.id, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        photo_url: updates.photo,
      });

      if (error) throw error;
      if (!profile) throw new Error('Failed to update profile');

      set({
        user: {
          ...user,
          ...updates,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
}));
