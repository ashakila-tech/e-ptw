import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import { useFeedbackForm } from "@/hooks/useFeedbackForm";
import { FEEDBACK_TYPES } from "@/../shared/constants/FeedbackTypes";
import DropdownField from "@/components/DropdownField";

export default function FeedbackForm() {
  const router = useRouter();
  const { title, setTitle, message, setMessage, loading, submitFeedback } = useFeedbackForm();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(FEEDBACK_TYPES.map((t) => ({ label: t, value: t })));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Give Feedback" onBack={() => router.back()} />
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-base text-gray-700 mb-2">Title</Text>
        <View className="mb-4">
          <DropdownField
            label="Title"
            open={open}
            value={title}
            items={items}
            setOpen={setOpen}
            setValue={setTitle}
            setItems={setItems}
            placeholder="Select feedback type"
            zIndex={1000}
          />
        </View>

        <Text className="text-base text-gray-700 mb-2">Message</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 h-40"
          placeholder="Enter your feedback here..."
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />

        <Pressable
          onPress={submitFeedback}
          disabled={loading}
          className={`rounded-xl py-4 mt-8 items-center ${loading ? "bg-gray-400" : "bg-bg1"}`}
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Submit Feedback</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}