import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.accent1,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mypermit"
          options={{
            title: 'My Permit',
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Colors.bg1,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              color: "#fff", // white text
              fontWeight: 'bold',
              fontSize: 20,
            },
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="permit.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: 'Notification',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="notification.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'My Profile',
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Colors.bg1,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              color: "#fff", // white text
              fontWeight: 'bold',
              fontSize: 20,
            },
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="user.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}