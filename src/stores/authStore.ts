import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: { ...session.user, ...profile } });
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: { ...session.user, ...profile } });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ user: { ...session.user, ...profile } });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', data.id);
      if (error) throw error;
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));