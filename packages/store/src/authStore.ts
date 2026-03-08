import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Session, User } from '@supabase/supabase-js';
import { showToast, supabase } from '@fuelmate/lib';

const SecureStore =
  Platform.OS !== 'web'
    ? (require('expo-secure-store') as typeof import('expo-secure-store'))
    : null;

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

const storage = createJSONStorage(() => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      const noopStorage: Storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      } as Storage;
      return noopStorage;
    }
    return localStorage;
  }

  return {
    getItem: (name: string) => (SecureStore ? SecureStore.getItemAsync(name) : Promise.resolve(null)),
    setItem: (name: string, value: string) => (SecureStore ? SecureStore.setItemAsync(name, value) : Promise.resolve()),
    removeItem: (name: string) =>
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
          const { data, error } = await supabase.auth.signInWithPassword({
            email: input.email,
            password: input.password,
          });
          if (error) {
            throw error;
          }
          set({ session: data.session, user: data.session?.user ?? null });
          showToast('Signed in', 'success');
        } catch (error) {
          showToast(
            error instanceof Error ? `Sign in failed: ${error.message}` : 'Sign in failed',
            'error'
          );
          throw error;
        }
      },
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ session: null, user: null });
          showToast('Signed out', 'success');
        } catch (error) {
          showToast(
            error instanceof Error ? `Sign out failed: ${error.message}` : 'Sign out failed',
            'error'
          );
          throw error;
        }
      },
      initialize: async () => {
        set({ loading: true });
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
      partialize: (state) => {
        if (!state) return { session: null, user: null };
        return { session: state.session ?? null, user: state.user ?? null };
      },
    }
  )
);
