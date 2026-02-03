import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import NotificationCard from '@/components/NotificationCard';
import LoadingScreen from '@/components/LoadingScreen';
import { Colors } from '@/constants/Colors';
import { useNotification } from '@/hooks/useNotification';

export default function NotificationTab() {
  const { notifications, loading, refetch } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

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
          <NotificationCard
            title={item.title}
            message={item.message}
            time={item.created_at}
            isRead={item.is_read}
          />
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