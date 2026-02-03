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
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";

export default function NearMissReportForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      crossPlatformAlert("Incomplete Form", "Please fill out all fields.");
      return;
    }
    setLoading(true);
    // In the future, an API call to submit the report will go here.
    // For now, we'll simulate a network request.
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    crossPlatformAlert("Success", "Your near miss report has been submitted.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Near Miss Report" onBack={() => router.back()} />
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-base text-gray-700 mb-2">Title / Subject</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="e.g., Slippery floor near entrance"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="text-base text-gray-700 mb-2">Location of Incident</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 mb-4"
          placeholder="e.g., Warehouse Section B"
          value={location}
          onChangeText={setLocation}
        />

        <Text className="text-base text-gray-700 mb-2">Description of Near Miss</Text>
        <TextInput
          className="border border-gray-300 rounded-2xl px-4 py-3 h-40 mb-4"
          placeholder="Describe what happened, what the risks were, and any immediate actions taken."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Pressable
          onPress={submitReport}
          disabled={loading}
          className={`rounded-xl py-4 mt-4 items-center ${loading ? "bg-gray-400" : "bg-bg1"}`}
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Submit Report</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}