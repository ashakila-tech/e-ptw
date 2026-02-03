import React from "react";
import { View, Text } from "react-native";
import { formatDate } from "@/utils/date";

type NotificationCardProps = {
  title: string;
  message: string;
  time: string | Date;
  isRead?: boolean;
};

export default function NotificationCard({
  title,
  message,
  time,
  isRead = false,
}: NotificationCardProps) {
  return (
    <View className={`bg-white rounded-lg w-full p-4 shadow-sm mb-3 ${isRead ? "opacity-70" : ""}`}>
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-primary text-lg font-bold flex-1 mr-2">{title}</Text>
        <Text className="text-gray-500 text-xs mt-1">{formatDate(time)}</Text>
      </View>
      <Text className="text-primary text-base leading-5">{message}</Text>
    </View>
  );
}