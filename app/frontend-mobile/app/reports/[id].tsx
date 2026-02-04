import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import CustomHeader from "@/components/CustomHeader";
import { Colors } from "@/constants/Colors";
import { useReportDetails } from "@/hooks/useReportDetails";
import { formatDate } from "@/utils/date";
import { downloadDocument } from "@/utils/download";
import * as Linking from "expo-linking";
import * as api from "../../../shared/services/api";
import { getMimeType } from "@/utils/file";

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

  // Helper to safely get document info whether it's from the relation object or flat fields
  const docName = report?.document?.name || report?.document_name;
  const docId = report?.document?.id || report?.document_id;

  const mimeType = getMimeType(docName);
  const isOffice = isOfficeFile(mimeType);

  function isOfficeFile(mime?: string) {
    if (!mime) return false;

    return (
      mime.includes("officedocument") || // docx, xlsx, pptx
      mime === "application/vnd.ms-excel" ||
      mime === "application/msword" ||
      mime === "text/csv"
    );
  }

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

          {/* Attachments Section */}
          <View className="mt-4 border-t border-gray-200 pt-4">
            <Text className="text-lg font-bold text-primary mb-3">Attachments</Text>
            {docId ? (
              <>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base text-primary flex-1 mr-2" numberOfLines={1}>
                    File: <Text className="font-semibold">{docName}</Text>
                  </Text>
                  <View className="flex-row">
                    {!isOffice && (
                      <TouchableOpacity
                        className="bg-blue-600 px-3 py-2 rounded mr-2"
                        onPress={() => {
                          const fileUrl = `${api.API_BASE_URL}api/documents/${docId}/view`;
                          if (Platform.OS === "android") {
                            Linking.openURL(fileUrl);
                            return;
                          }
                          router.push({
                            pathname: "/permits/fileViewer",
                            params: { fileUrl, fileName: docName, fileType: mimeType },
                          });
                        }}
                      >
                        <Text className="text-white text-sm font-semibold">View</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => downloadDocument(docId, docName)}
                      className="bg-primary px-3 py-2 rounded"
                    >
                      <Text className="text-white text-sm font-semibold">Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {isOffice && (
                  <Text className="text-xs text-rejected">
                    No Preview. Office documents must be downloaded to view.
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-gray-500 italic">No attachment available</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}