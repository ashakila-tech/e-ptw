import React from "react";
import { View, Text, ScrollView } from "react-native";
import { formatDate } from "@/utils/date";

interface Feedback {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

interface FeedbackTableProps {
  feedbacks: Feedback[];
}

const FeedbackTable: React.FC<FeedbackTableProps> = ({ feedbacks }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View>
        {/* Table Header */}
        <View className="flex-row bg-gray-50 border-b border-gray-200">
          <Text className="p-3 w-16 font-semibold text-primary">#</Text>
          <Text className="p-3 w-32 font-semibold text-primary">Date</Text>
          <Text className="p-3 w-40 font-semibold text-primary">Title</Text>
          <Text className="p-3 w-64 font-semibold text-primary">Message</Text>
        </View>

        {/* Table Body */}
        {feedbacks.map((fb, index) => (
          <View key={fb.id} className="flex-row border-b border-gray-200 items-start">
            <Text className="p-3 w-16 text-primary">{index + 1}</Text>
            <Text className="p-3 w-32 text-primary">{formatDate(fb.created_at)}</Text>
            <Text className="p-3 w-40 text-primary font-medium">{fb.title}</Text>
            <Text className="p-3 w-64 text-primary text-sm">{fb.message}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default FeedbackTable;