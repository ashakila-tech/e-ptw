import React, { useEffect, useState } from "react";
import { Button, Alert } from "react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { downloadDocument } from "@/utils/download";
import dayjs from "dayjs";
import Constants from "expo-constants";
import { useUser } from "@/contexts/UserContext";
import LoadingScreen from "@/components/LoadingScreen";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const [permit, setPermit] = useState<any | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isApproval } = useUser();

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch permit
      const res = await fetch(`${API_BASE_URL}api/applications/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch permit (${res.status})`);
      const permitData = await res.json();

      // 2. Fetch related entities in parallel (except approvals)
      const [docRes, locRes, typeRes, workflowRes, assignerRes] = await Promise.all([
        fetch(`${API_BASE_URL}api/documents/${permitData.document_id}`),
        fetch(`${API_BASE_URL}api/locations/${permitData.location_id}`),
        fetch(`${API_BASE_URL}api/permit-types/${permitData.permit_type_id}`),
        fetch(`${API_BASE_URL}api/workflow-data/${permitData.workflow_data_id}`),
        permitData.job_assigner_id
          ? fetch(`${API_BASE_URL}api/users/${permitData.job_assigner_id}`)
          : Promise.resolve(null),
      ]);

      const [document, location, permitType, workflowData, jobAssigner] = await Promise.all([
        docRes.json(),
        locRes.json(),
        typeRes.json(),
        workflowRes.json(),
        assignerRes ? assignerRes.json() : null,
      ]);

      // 3. ✅ Fetch approvals based on workflow_id
      const approvalsRes = await fetch(
        `${API_BASE_URL}api/approvals/?workflow_id=${workflowData.workflow_id}`
      );
      const approvalsJson = await approvalsRes.json();

      // 4. Set state
      setPermit({
        id: permitData.id,
        name: permitData.name,
        status: permitData.status,
        document: document?.name || "",
        documentUrl: document ? `${API_BASE_URL}uploads/${document.path}` : undefined,
        location: location?.name || "",
        permitType: permitType?.name || "",
        workflowData: workflowData?.name || "",
        createdBy: permitData.created_by ?? "",
        createdTime: permitData.created_time,
        workStartTime: workflowData?.start_time ?? undefined,
        workEndTime: workflowData?.end_time ?? undefined,
        applicantId: permitData.applicant_id,
        documentId: permitData.document_id ?? undefined,
        locationId: permitData.location_id ?? undefined,
        permitTypeId: permitData.permit_type_id ?? undefined,
        workflowDataId: permitData.workflow_data_id ?? undefined,
        jobAssigner: jobAssigner?.name || "-",
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
    return <LoadingScreen message="Fetching data..." />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-rejected mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchPermit}
          className="bg-primary px-6 py-3 rounded-lg"
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
    <>
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
      <ScrollView className="flex-1 p-4 bg-gray-100">
        <View className="p-4 mb-4">
          <Text className="text-center text-2xl font-bold text-primary">
            {permit.name}
          </Text>
        </View>

        {/* Permit Info */}
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

          <Text className="text-base text-primary mb-2">
            Job Assigner: <Text className="font-semibold">{permit.jobAssigner || "-"}</Text>
          </Text>

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
                permit.documentUrl &&
                downloadDocument(permit.documentUrl, permit.document)
              }
              className="bg-primary px-3 py-2 rounded"
            >
              <Text className="text-white text-sm font-semibold">Download</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Approvals Section */}
        <View className="bg-white rounded-xl p-4">
          <Text className="text-lg font-bold text-primary mb-3">Approvals</Text>
          {Array.isArray(approvals) && approvals.length > 0 ? (
            approvals.map((a, idx) => (
              <View
                key={a.id || idx}
                className="border-b border-gray-300 pb-2 mb-2"
              >
                <Text className="font-semibold text-primary">
                  {a.role_name || a.roleName || "Role"}
                </Text>
                <Text className="text-primary">
                  {a.approver_name || a.approverName || "Unknown"} -{" "}
                  <Text
                    className={
                      a.status === "Approved"
                        ? "text-approved font-semibold"
                        : a.status === "Pending"
                        ? "text-pending font-semibold"
                        : a.status === "Rejected"
                        ? "text-rejected font-semibold"
                        : "text-primary font-semibold"
                    }
                  >
                    {a.status || "N/A"}
                  </Text>
                </Text>
                <Text className="text-xs text-gray-500">
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

        {/* Action Buttons */}
        {isApproval && (
          <View className="flex-row mt-6 space-x-4">
            <Pressable
              onPress={() => {
                console.log("Rejecting permit:", permit.id);
                Alert.alert("Rejection", "Permit rejected successfully (mock).");
              }}
              className="flex-[0.4] bg-rejected py-3 mr-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Reject</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                console.log("Approving permit:", permit.id);
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
