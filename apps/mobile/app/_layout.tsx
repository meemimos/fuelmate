import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Geist_400Regular, Geist_700Bold } from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, Text } from 'react-native';
import Toast from 'react-native-toast-message';

import '../global.css';
import { useColorScheme } from '@/components/useColorScheme';
import { OfflineBanner } from '@/components/OfflineBanner';
import { toastConfig } from '@/components/ToastConfig';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function WebAppShell() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal/station" options={{ presentation: 'modal', title: 'Station' }} />
          <Stack.Screen name="modal/add-alert" options={{ presentation: 'modal', title: 'Add Alert' }} />
          <Stack.Screen name="modal/log-fill" options={{ presentation: 'modal', title: 'Log Fill' }} />
          <Stack.Screen name="modal/invite" options={{ presentation: 'modal', title: 'Invite' }} />
        </Stack>
      </ThemeProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

function NativeAppShell() {
  const store = require('@fuelmate/store');
  const useAuthStore = store.useAuthStore;

  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((state: any) => state.session);
  const loading = useAuthStore((state: any) => state.loading);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
    if (session && inAuthGroup) {
      router.replace('/(tabs)/prices');
    }
  }, [loading, router, segments, session]);

  return (
    <SafeAreaProvider>
      <OfflineBanner />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal/station" options={{ presentation: 'modal', title: 'Station' }} />
          <Stack.Screen name="modal/add-alert" options={{ presentation: 'modal', title: 'Add Alert' }} />
          <Stack.Screen name="modal/log-fill" options={{ presentation: 'modal', title: 'Log Fill' }} />
          <Stack.Screen name="modal/invite" options={{ presentation: 'modal', title: 'Invite' }} />
        </Stack>
      </ThemeProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_700Bold,
    GeistMono_400Regular,
    PlayfairDisplay_400Regular_Italic,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && Platform.OS !== 'web') {
      const store = require('@fuelmate/store');
      store.useAuthStore.getState().initialize();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19' }}>
        <Text style={{ color: '#dbeafe' }}>Loading FuelMate…</Text>
      </View>
    );
  }

  return Platform.OS === 'web' ? <WebAppShell /> : <NativeAppShell />;
}
