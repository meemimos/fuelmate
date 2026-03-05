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
  signIn: (input: { email: string; password: string } | { mock: true }) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

// Create storage adapter - Zustand v5 createJSONStorage expects a function returning storage-like object
const storage = createJSONStorage(() => {
  if (Platform.OS === 'web') {
    // Web: use localStorage directly, with SSR guard
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      // SSR fallback - return a no-op storage that matches localStorage API
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

  // Mobile: return async storage adapter matching SecureStore API
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
          if ('mock' in input && input.mock) {
            const devUser = { id: 'dev-user-123' } as User;
            set({ user: devUser, session: null, loading: false });
            showToast('Signed in (dev)', 'success');
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
      partialize: (state) => {
        // Guard against undefined state during SSR/hydration
        if (!state) return { session: null, user: null };
        return { session: state.session ?? null, user: state.user ?? null };
      },
    }
  )
);
