import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

// TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
export const registerForPushNotifications = async () => {
  // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
  if (Platform.OS === 'android') {
    // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff6b00',
    });
  }

  // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;

  // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data;
};

// TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
export const saveTokenToSupabase = async (token: string) => {
  // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated.');
  }
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', data.user.id);
  if (updateError) {
    throw updateError;
  }
};

// TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
export const scheduleLocalNotification = async (title: string, body: string) => {
  // TODO: Replace polling with Supabase Edge Function + pg_cron for server-side price monitoring
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
};
