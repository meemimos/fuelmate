import React from 'react';
import { Tabs } from 'expo-router';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff6b00',
        tabBarInactiveTintColor: '#8888a0',
        tabBarStyle: { backgroundColor: '#0c0c0e', borderTopColor: '#252530' },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen name="prices" options={{ title: 'Prices' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="group" options={{ title: 'Group' }} />
      <Tabs.Screen name="tracker" options={{ title: 'Tracker' }} />
    </Tabs>
  );
}
