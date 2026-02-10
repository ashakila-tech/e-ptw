import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import NotificationCard from '@/components/NotificationCard';
import LoadingScreen from '@/components/LoadingScreen';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/hooks/useNotification';

export default function NotificationTab() {
  const { notifications, loading, refetch } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  // Refetch notifications whenever the screen comes into focus to see read/unread status changes
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="bg-bg1 py-4 px-4 shadow-sm mb-2">
        <Text className="text-white text-xl font-bold text-center">Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationCard notification={item} />
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-base">No notifications found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}