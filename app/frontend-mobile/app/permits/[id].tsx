import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable, Alert } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { usePermitDetails } from "@/hooks/usePermitDetails";
import { useUser } from "@/contexts/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import dayjs from "dayjs";
import { downloadDocument } from "@/utils/download";

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const { permit, approvals, loading, error, refetch } = usePermitDetails(id as string);
  const { isApproval } = useUser();

  if (loading) return <LoadingScreen message="Fetching data..." />;

  if (error)
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-rejected mb-4">{error}</Text>
        <TouchableOpacity onPress={refetch} className="bg-primary px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );

  if (!permit)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No permit found</Text>
      </View>
    );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Permit Details",
          headerTitleAlign: "left",
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
        }}
      />

      <ScrollView className="flex-1 p-4 bg-gray-100">
        {/* Title */}
        <View className="p-4 mb-4">
          <Text className="text-center text-2xl font-bold text-primary">{permit.name}</Text>
        </View>

        {/* Details */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Details</Text>
          <Text className="text-base text-primary mb-2">
            Status:{" "}
            <Text
              className={
                permit.status === "Approved"
                  ? "text-approved font-semibold"
                  : permit.status === "Pending"
                  ? "text-pending font-semibold"
                  : permit.status === "Rejected"
                  ? "text-rejected font-semibold"
                  : "text-primary font-semibold"
              }
            >
              {permit.status}
            </Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Permit Type: <Text className="font-semibold">{permit.permitType || "-"}</Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Location: <Text className="font-semibold">{permit.location || "-"}</Text>
          </Text>
          {/* Comment this job assigner for now */}
          {/* <Text className="text-base text-primary mb-2">
            Job Assigner: <Text className="font-semibold">{permit.jobAssigner || "-"}</Text>
          </Text> */}
          <Text className="text-base text-primary mb-2">
            Created:{" "}
            <Text className="font-semibold">
              {permit.createdTime
                ? dayjs(permit.createdTime).format("DD-MM-YYYY hh:mm A")
                : "-"}
            </Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Work Start:{" "}
            <Text className="font-semibold">
              {permit.workStartTime
                ? dayjs(permit.workStartTime).format("DD-MM-YYYY hh:mm A")
                : "-"}
            </Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Work End:{" "}
            <Text className="font-semibold">
              {permit.workEndTime
                ? dayjs(permit.workEndTime).format("DD-MM-YYYY hh:mm A")
                : "-"}
            </Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Workflow: <Text className="font-semibold">{permit.workflowData || "-"}</Text>
          </Text>
        </View>

        {/* Attachments */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Attachments</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-primary">
              Document: <Text className="font-semibold">{permit.document}</Text>
            </Text>
            <TouchableOpacity
              disabled={!permit.documentUrl}
              onPress={() =>
                permit.documentUrl && downloadDocument(permit.documentUrl, permit.document)
              }
              className="bg-primary px-3 py-2 rounded"
            >
              <Text className="text-white text-sm font-semibold">Download</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Approvals */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Approvals</Text>

          {Array.isArray(approvals) && approvals.length > 0 ? (
            approvals.map((a, idx) => {
              const status = a.status?.toLowerCase?.();

              return (
                <View
                  key={a.id || idx}
                  className="border-b border-gray-200 pb-3 mb-3"
                >
                  <Text className="text-base text-primary mb-1">
                    Role: <Text className="font-semibold">{a.role_name || a.roleName || "Role"}</Text>
                  </Text>

                  <Text className="text-base text-primary mb-1">
                    Approver:{" "}
                    <Text className="font-semibold">
                      {a.approver_name || "Unknown"}
                    </Text>
                  </Text>

                  <Text className="text-base text-primary mb-1">
                    Status:{" "}
                    <Text
                      className={
                        status === "approved"
                          ? "text-approved font-semibold"
                          : status === "pending"
                          ? "text-pending font-semibold"
                          : status === "rejected"
                          ? "text-rejected font-semibold"
                          : "text-primary font-semibold"
                      }
                    >
                      {a.status || "N/A"}
                    </Text>
                  </Text>

                  <Text className="text-base text-primary mb-0">
                    Time:{" "}
                    <Text className="font-semibold">
                      {a.time
                        ? dayjs(a.time).format("DD-MM-YYYY hh:mm A")
                        : "-"}
                    </Text>
                  </Text>
                </View>
              );
            })
          ) : (
            <Text className="text-gray-500 italic">No approvals yet</Text>
          )}
        </View>

        {/* Approval Buttons (Mock) */}
        {isApproval && (
          <View className="flex-row mt-6 space-x-4">
            <Pressable
              onPress={() => {
                Alert.alert("Rejection", "Permit rejected successfully (mock).");
              }}
              className="flex-[0.4] bg-rejected py-3 mr-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Reject</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Alert.alert("Approval", "Permit approved successfully (mock).");
              }}
              className="flex-[0.6] bg-approved py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Approve</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </>
  );
}