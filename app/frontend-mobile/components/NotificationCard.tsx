import React from "react";
import { View, Text, Pressable } from "react-native";
import { formatDate } from "@/utils/date";
import { useRouter } from "expo-router";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

type NotificationCardProps = {
  notification: Notification;
};

export default function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: `../notifications/${notification.id}`,
      params: { notification: JSON.stringify(notification) },
    });
  };

  return (
    <Pressable onPress={handlePress} className={`bg-white rounded-lg w-full p-4 shadow-sm mb-3 ${notification.is_read ? "opacity-70" : ""}`}>
      <Text className="text-primary text-lg font-bold flex-1 mr-2">{notification.title}</Text>
      <Text className="text-gray-500 text-xs mt-1">{formatDate(notification.created_at)}</Text>
      <View className="items-end mt-2">
        <Text className="text-blue-600 font-semibold">View Details</Text>
      </View>
    </Pressable>
  );
}