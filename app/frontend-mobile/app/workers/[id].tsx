import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { useWorkerDetails } from "@/hooks/useWorkerDetails";
import CustomHeader from "@/components/CustomHeader";
import { Colors } from "@/constants/Colors";

export default function WorkerDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { worker, loading, error, refetch } = useWorkerDetails(id as string);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (loading) return <LoadingScreen message="Fetching worker data..." />;

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-rejected mb-4">{error}</Text>
        <TouchableOpacity onPress={refetch} className="bg-primary px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!worker) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No worker found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <CustomHeader title="Worker Details" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Worker Information */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Worker Information</Text>

          {worker.picture_url && (
            <View className="items-center my-4">
              <Image
                source={{ uri: worker.picture_url }}
                className="w-32 h-32 rounded-full bg-gray-300"
                resizeMode="cover"
              />
            </View>
          )}
          
          <View className="mb-3">
            <Text className="text-base text-primary">Name:</Text>
            <Text className="font-semibold text-lg text-primary">{worker.name || "-"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-base text-primary">IC/Passport:</Text>
            <Text className="font-semibold text-lg text-primary">{worker.ic_passport || "-"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-base text-primary">Position:</Text>
            <Text className="font-semibold text-lg text-primary">{worker.position || "-"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-base text-primary">Company:</Text>
            <Text className="font-semibold text-lg text-primary">{worker.company_name || "-"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-base text-primary">Contact:</Text>
            <Text className="font-semibold text-lg text-primary">{worker.contact || "-"}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-base text-primary">Employment Status:</Text>
            <Text className="font-semibold text-lg text-primary capitalize">{worker.employment_status?.replace("-", " ") || "-"}</Text>
          </View>
          <View>
            <Text className="text-base text-primary">Employment Type:</Text>
            <Text className="font-semibold text-lg text-primary capitalize">{worker.employment_type?.replace("-", " ") || "-"}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}