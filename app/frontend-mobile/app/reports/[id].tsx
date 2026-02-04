import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import CustomHeader from "@/components/CustomHeader";
import { Colors } from "@/constants/Colors";
import { useReportDetails } from "@/hooks/useReportDetails";
import { formatDate } from "@/utils/date";
import { downloadDocument } from "@/utils/download";

export default function ReportDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { report, loading, error, refetch } = useReportDetails(id as string);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDownload = () => {
    if (report?.document_id && report?.document_name) {
      downloadDocument(report.document_id, report.document_name);
    }
  };

  if (loading) return <LoadingScreen message="Fetching report details..." />;

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

  if (!report) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No report found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <CustomHeader title="Report Details" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-primary mb-4">{report.name}</Text>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">Location</Text>
            <Text className="text-base text-primary font-semibold">{report.location_name || "Unknown"}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">Department</Text>
            <Text className="text-base text-primary font-semibold">{report.department_name || "-"}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">Incident Date & Time</Text>
            <Text className="text-base text-primary font-semibold">{formatDate(report.incident_timestamp)}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">Condition</Text>
            <Text className="text-base text-primary font-semibold capitalize">{report.condition || "-"}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">Type of Concern</Text>
            <Text className="text-base text-primary font-semibold capitalize">{report.concern || "-"}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-500">Description</Text>
            <Text className="text-base text-primary mt-1">{report.description || "-"}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">Immediate Action</Text>
            <Text className="text-base text-primary mt-1">{report.immediate_action || "-"}</Text>
          </View>

          {report.document_id && (
            <TouchableOpacity onPress={handleDownload} className="bg-green-600 py-3 rounded-lg items-center mt-2">
              <Text className="text-white font-semibold">Download Attachment</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}