import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const SecureStore =
  Platform.OS !== 'web'
    ? (require('expo-secure-store') as typeof import('expo-secure-store'))
    : null;

const WebStorageAdapter = {
  getItem: (key: string) =>
    Promise.resolve(typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const NativeStorageAdapter = {
  getItem: (key: string) => (SecureStore ? SecureStore.getItemAsync(key) : Promise.resolve(null)),
  setItem: (key: string, value: string) =>
    SecureStore ? SecureStore.setItemAsync(key, value) : Promise.resolve(),
  removeItem: (key: string) =>
    SecureStore ? SecureStore.deleteItemAsync(key) : Promise.resolve(),
};

function createMockSupabase() {
  return {
    auth: {
      async signInWithPassword() {
        return { data: { session: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } } as any;
      },
      async getUser() {
        return { data: { user: null }, error: null };
      },
    },
    from() {
      return {
        select() {
          return {
            eq: async () => ({ data: [], error: null }),
          };
        },
        insert() {
          return {
            select: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          };
        },
        update() {
          return {
            eq: async () => ({ error: null }),
          };
        },
        delete() {
          return {
            eq: async () => ({ error: null }),
          };
        },
      };
    },
  } as any;
}

export { Database };

export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockSupabase() as ReturnType<typeof createClient<Database>>;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: Platform.OS === 'web' ? WebStorageAdapter : NativeStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const supabase = createSupabaseClient();
