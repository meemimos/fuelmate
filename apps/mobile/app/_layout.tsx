import { Geist_400Regular, Geist_700Bold, Geist_800ExtraBold } from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useRef } from 'react';
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
  const hydrationRef = useRef(false);
  
  // Clear any corrupted navigation state on web ONCE at startup
  useEffect(() => {
    if (Platform.OS === 'web' && !hydrationRef.current) {
      try {
        localStorage.removeItem('NAVIGATION_STATE_V1');
        sessionStorage.removeItem('NAVIGATION_STATE_V1');
        sessionStorage.clear();
      } catch (e) {
        // Silently ignore any storage errors
      }
      hydrationRef.current = true;
    }
  }, [])
  
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
    
    // On web, use a more robust navigation strategy
    if (Platform.OS === 'web') {
      // Ensure window is available (client-side only)
      if (typeof window === 'undefined') return;
      
      // Wait for all DOM updates and router initialization to complete
      // Use a multi-step timing strategy to handle various hydration issues
      const timerId = setTimeout(() => {
        if (!router) return;
        
        const frameId = requestAnimationFrame(() => {
          try {
            // Additional safety: ensure router methods are available
            if (typeof router.replace !== 'function') {
              console.warn('Router not ready yet');
              return;
            }
            
            const targetRoute = user ? '/(tabs)/prices' : '/(auth)/welcome';
            
            // Use try-catch and log for debugging
            try {
              router.replace(targetRoute);
            } catch (navError) {
              console.warn('Navigation error:', navError);
              // Don't retry here - let the component manage navigation
            }
          } catch (error) {
            console.warn('Unexpected error during navigation setup:', error);
          }
        });
        
        return () => cancelAnimationFrame(frameId);
      }, 100); // Increased delay to ensure DOM is fully hydrated
      
      return () => clearTimeout(timerId);
    }
    
    // Native: navigate immediately (router is always ready on native)
    try {
      const targetRoute = user ? '/(tabs)/prices' : '/(auth)/welcome';
      router.replace(targetRoute);
    } catch (error) {
      console.warn('Native navigation error:', error);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications().then((token) => {
      if (token) saveTokenToSupabase(token);
    });

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      try {
        // Safely access notification properties with fallbacks
        const title = notification?.request?.content?.title ?? notification?.request?.content?.titleNumberOfLinesKey ?? 'Alert';
        const message = notification?.request?.content?.body ?? '';
        showToast(title, 'info');
      } catch (error) {
        console.warn('Error processing notification:', error);
        showToast('Alert received', 'info');
      }
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

  // Prevent SSR issues on web by only rendering on client
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return null;
  }

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

// Configure initial route for web platform
export const unstable_settings = {
  initialRouteName: '(tabs)',
};
