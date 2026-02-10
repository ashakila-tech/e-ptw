import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateNotification } from '../../../shared/services/api';
import { formatDate } from '@/utils/date';
import CustomHeader from '@/components/CustomHeader';

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationDetailPage() {
  const { notification: notificationString } = useLocalSearchParams<{ notification: string }>();
  const [notification, setNotification] = useState<Notification | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (notificationString) {
      const parsedNotification = JSON.parse(notificationString) as Notification;
      setNotification(parsedNotification);

      // Mark as read if it's not already
      if (!parsedNotification.is_read) {
        updateNotification(parsedNotification.id, { is_read: true })
          .catch(err => console.error("Failed to mark notification as read:", err));
      }
    }
  }, [notificationString]);

  if (!notification) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-secondary">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <CustomHeader title="Notification Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white p-6 rounded-lg shadow-sm">
          <Text className="text-2xl font-bold text-primary mb-2">{notification.title}</Text>
          <Text className="text-gray-500 text-sm mb-6">{formatDate(notification.created_at)}</Text>
          <View className="border-b border-gray-200 mb-6" />
          <Text className="text-base text-primary leading-6">{notification.message}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}