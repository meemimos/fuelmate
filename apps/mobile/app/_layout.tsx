import { Geist_400Regular, Geist_700Bold, Geist_800ExtraBold } from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { registerForPushNotifications, saveTokenToSupabase, showToast, MOCK_STATIONS } from '@fuelmate/lib';
import { useAlertsStore, useAuthStore } from '@fuelmate/store';
import { colorScheme } from 'nativewind';

import '../global.css';
import { OfflineBanner } from '@/components/OfflineBanner';
import { toastConfig } from '@/components/ToastConfig';

export { ErrorBoundary } from 'expo-router';

const FUEL_ALERT_TASK = 'CHECK-FUEL-ALERTS';

function NativeWindThemeProvider({
  defaultTheme,
  children,
}: {
  defaultTheme: 'dark' | 'light';
  children: ReactNode;
}) {
  useEffect(() => {
    colorScheme.set(defaultTheme);
  }, [defaultTheme]);

  return <View className={defaultTheme === 'dark' ? 'dark flex-1' : 'flex-1'}>{children}</View>;
}

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(FUEL_ALERT_TASK)) {
  TaskManager.defineTask(FUEL_ALERT_TASK, async () => {
    try {
      const { checkAlerts } = useAlertsStore.getState();
      const stations = MOCK_STATIONS;
      await checkAlerts(stations);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export default function RootLayout() {
  const router = useRouter();
  
  // ✅ Guard against store not being ready on web
  const user = useAuthStore((s) => s?.user ?? null);
  const initialize = useAuthStore((s) => s?.initialize ?? (() => {}));
  const loading = useAuthStore((s) => s?.loading ?? true);

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_400Regular,
    PlayfairDisplay_400Regular_Italic,
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/(auth)/welcome');
    else router.replace('/(tabs)/prices');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications().then((token) => {
      if (token) saveTokenToSupabase(token);
    });

    const sub = Notifications.addNotificationReceivedListener((n) => {
      showToast(n.request.content.title ?? 'Alert', 'info');
    });

    return () => sub.remove();
  }, [user]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    BackgroundFetch.registerTaskAsync(FUEL_ALERT_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!fontsLoaded || loading) return;
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) return null;

  return (
    <NativeWindThemeProvider defaultTheme="dark">
      <SafeAreaProvider>
        <View className="flex-1 bg-bg dark:bg-bg">
          <OfflineBanner />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal/station" options={{ presentation: 'modal', title: 'Station' }} />
            <Stack.Screen name="modal/add-alert" options={{ presentation: 'modal', title: 'Add Alert' }} />
            <Stack.Screen name="modal/log-fill" options={{ presentation: 'modal', title: 'Log Fill' }} />
            <Stack.Screen name="modal/invite" options={{ presentation: 'modal', title: 'Invite' }} />
          </Stack>
          <Toast config={toastConfig} />
        </View>
      </SafeAreaProvider>
    </NativeWindThemeProvider>
  );
}
