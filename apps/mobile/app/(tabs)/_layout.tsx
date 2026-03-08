import React from 'react';
import { Tabs } from 'expo-router';
import { BarChart2, Bell, MapPin, Settings, Users } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00e5a0',
        tabBarInactiveTintColor: '#50505e',
        tabBarStyle: {
          backgroundColor: '#131316',
          borderTopColor: '#252530',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: 'GeistMono_400Regular',
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        },
      }}
    >
      <Tabs.Screen
        name="prices"
        options={{
          title: 'Prices',
          tabBarLabel: 'Prices',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size ?? 18} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size ?? 18} />,
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: 'Group',
          tabBarLabel: 'Group',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size ?? 18} />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarLabel: 'Tracker',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size ?? 18} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size ?? 18} />,
        }}
      />
    </Tabs>
  );
}
