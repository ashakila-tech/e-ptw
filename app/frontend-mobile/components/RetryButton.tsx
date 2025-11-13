import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

interface RetryButtonProps {
  onRetry: () => void;
  message?: string;
  label?: string;
}

export default function RetryButton({
  onRetry,
  message = "Something went wrong.",
  label = "Retry",
}: RetryButtonProps) {
  return (
    <View className="items-center">
      <Text className="text-red-500 mb-2">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-bg1 px-4 py-2 rounded-lg"
      >
        <Text className="text-white font-semibold">{label}</Text>
      </TouchableOpacity>
    </View>
  );
}