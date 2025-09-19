import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { API_BASE_URL } from "@env";
import dayjs from "dayjs";

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const [permit, setPermit] = useState<PermitData | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}api/applications/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch permit (${res.status})`);

      const permitData: PermitAPI = await res.json();

      // Fetch related entities in parallel
      const [docRes, locRes, typeRes, workflowRes, approvalsRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}api/documents/${permitData.document_id}`),
          fetch(`${API_BASE_URL}api/locations/${permitData.location_id}`),
          fetch(`${API_BASE_URL}api/permit-types/${permitData.permit_type_id}`),
          fetch(`${API_BASE_URL}api/workflow-data/${permitData.workflow_data_id}`),
          fetch(`${API_BASE_URL}api/approvals/${permitData.workflow_data_id}`),
        ]);

      const [document, location, permitType, workflowData, approvalsJson] =
        await Promise.all([
          docRes.json(),
          locRes.json(),
          typeRes.json(),
          workflowRes.json(),
          approvalsRes.json(),
        ]);

      setPermit({
        id: permitData.id,
        name: permitData.name,
        status: permitData.status,
        document: document?.name || "",
        location: location?.name || "",
        permitType: permitType?.name || "",
        workflowData: workflowData?.name || "",
        createdBy: permitData.created_by ?? "",
        createdTime: permitData.created_time,
        workStartTime: permitData.work_start_time ?? undefined,
        applicantId: permitData.applicant_id,
        documentId: permitData.document_id ?? undefined,
        locationId: permitData.location_id ?? undefined,
        permitTypeId: permitData.permit_type_id ?? undefined,
        workflowDataId: permitData.workflow_data_id ?? undefined,
      });

      setApprovals(Array.isArray(approvalsJson) ? approvalsJson : []);
    } catch (err: any) {
      console.error("Error fetching permit details:", err);
      setError(err.message || "Failed to fetch permit details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" className="mt-10" />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-600 mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchPermit}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permit) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No permit found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-gray-100">
      <Stack.Screen
        options={{
          title: "Permit Details",
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />

      <View className="p-4 mb-4">
        <Text className="text-center text-2xl font-bold text-gray-800">
          {permit.name}
        </Text>
      </View>

      {/* Permit Info */}
      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Details
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Status:{" "}
          <Text
            className={
              permit.status === "Approved"
                ? "text-green-600 font-semibold"
                : permit.status === "Pending"
                ? "text-yellow-600 font-semibold"
                : permit.status === "Rejected"
                ? "text-red-600 font-semibold"
                : "text-gray-800 font-semibold"
            }
          >
            {permit.status}
          </Text>
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Permit Type: {permit.permitType || "-"}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Location: {permit.location || "-"}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Document: {permit.document || "-"}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Workflow: {permit.workflowData || "-"}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Created:{" "}
          {permit.createdTime
            ? dayjs(permit.createdTime).format("DD-MM-YYYY HH:mm")
            : "-"}
        </Text>
        <Text className="text-gray-700 mb-2">
          Work Start: {permit.workStartTime ? dayjs(permit.workStartTime).format("DD-MM-YYYY HH:mm") : "-"}
        </Text>

        <Text className="text-gray-700 mb-2">
          Work End: {permit.workEndTime ? dayjs(permit.workEndTime).format("DD-MM-YYYY HH:mm") : "-"}
        </Text>
      </View>

      {/* Approvals Section */}
      <View className="bg-white rounded-xl p-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Approvals
        </Text>
        {Array.isArray(approvals) && approvals.length > 0 ? (
          approvals.map((a, idx) => (
            <View
              key={a.id || idx}
              className="border-b border-gray-300 pb-2 mb-2"
            >
              <Text className="font-semibold text-gray-800">
                {a.role_name || a.roleName || "Role"}
              </Text>
              <Text className="text-gray-600">
                {a.approver_name || a.approverName || "Unknown"} –{" "}
                {a.status || "N/A"}
              </Text>
              <Text className="text-gray-500 text-xs">
                {a.time
                  ? dayjs(a.time).format("DD-MM-YYYY HH:mm")
                  : "No timestamp"}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500 italic">No approvals yet</Text>
        )}
      </View>
    </ScrollView>
  );
}