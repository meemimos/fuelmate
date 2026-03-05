import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { showError, showSuccess } from '../lib/toast';

const SecureStore =
  Platform.OS !== 'web'
    ? (require('expo-secure-store') as typeof import('expo-secure-store'))
    : null;

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (input: { email: string; password: string } | { mock: true }) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

const storage = createJSONStorage(() => {
  if (Platform.OS === 'web') {
    return {
      getItem: (name) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(name)),
      setItem: (name, value) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(name, value);
        }
      },
      removeItem: (name) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(name);
        }
      },
    };
  }

  return {
    getItem: (name) => (SecureStore ? SecureStore.getItemAsync(name) : Promise.resolve(null)),
    setItem: (name, value) => (SecureStore ? SecureStore.setItemAsync(name, value) : Promise.resolve()),
    removeItem: (name) =>
      SecureStore ? SecureStore.deleteItemAsync(name) : Promise.resolve(),
  };
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      signIn: async (input) => {
        try {
          if ('mock' in input && input.mock) {
            const devUser = { id: 'dev-user-123' } as User;
            set({ user: devUser, session: null, loading: false });
            showSuccess('Signed in (dev)');
            return;
          }
          const { data, error } = await supabase.auth.signInWithPassword({
            email: input.email,
            password: input.password,
          });
          if (error) {
            throw error;
          }
          set({ session: data.session, user: data.session?.user ?? null });
          showSuccess('Signed in');
        } catch (error) {
          showError('Sign in failed', error instanceof Error ? error.message : 'Try again.');
          throw error;
        }
      },
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ session: null, user: null });
          showSuccess('Signed out');
        } catch (error) {
          showError('Sign out failed', error instanceof Error ? error.message : 'Try again.');
          throw error;
        }
      },
      initialize: async () => {
        set({ loading: true });

        // Dev-login bypass: set a mock user/session when the dev flag is enabled.
        // Enable by setting EXPO_PUBLIC_DEV_LOGIN=true in your environment or
        // by setting globalThis.__FUELMATE_DEV_LOGIN = true in a dev console.
        const envFlag = typeof process !== 'undefined' && (process.env as any).EXPO_PUBLIC_DEV_LOGIN === 'true';
        const globalFlag = typeof globalThis !== 'undefined' && (globalThis as any).__FUELMATE_DEV_LOGIN === true;
        if (envFlag || globalFlag) {
          const devUser = { id: 'dev-user-123', email: 'dev@localhost' } as User;
          set({ user: devUser, session: null, loading: false });
          // still attach listener to keep behavior consistent
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ session: session ?? null, user: session?.user ?? null });
          });
          return;
        }

        const { data } = await supabase.auth.getSession();
        set({ session: data.session ?? null, user: data.session?.user ?? null, loading: false });
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session: session ?? null, user: session?.user ?? null });
        });
      },
    }),
    {
      name: 'fuelmate-auth',
      storage,
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
