import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photo?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    set({
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name,
        phone: profile.phone,
        photo: profile.photo_url,
      }
    });
  },

  signUp: async (email: string, password: string, name: string) => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!user) throw new Error('No user returned after signup');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          name,
          email,
          photo_url: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        }
      ]);

    if (profileError) throw profileError;

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    set({
      session,
      user: {
        id: user.id,
        email,
        name,
        photo: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      }
    });
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },

  restoreSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          session,
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            phone: profile.phone,
            photo: profile.photo_url,
          }
        });
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { session } = get();
    if (!session?.user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        phone: updates.phone,
        photo_url: updates.photo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) throw error;

    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },
}));