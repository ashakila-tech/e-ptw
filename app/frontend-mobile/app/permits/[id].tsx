import React from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { View, Text, ScrollView, TouchableOpacity, Pressable, Alert } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { usePermitDetails } from "@/hooks/usePermitDetails";
import { useUser } from "@/contexts/UserContext";
import { downloadDocument } from "@/utils/download";
import { getStatusClass } from "@/utils/class";
import { formatDate } from "@/utils/date";
import { PermitStatus } from "@/constants/Status";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const { permit, approvals, approvalData, loading, error, refetch } = usePermitDetails(id as string);
  const { userId, isApproval } = useUser();

  console.log(
    "approvalData:",
    approvalData.map(d => ({
      id: d.id,
      approval_id: d.approval_id,
      status: d.status,
    }))
  );

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

  // Find the current user's approval record
  const myApproval = approvals?.find(
    (a) => a.user_id === userId && a.status === PermitStatus.PENDING
  );

  console.log("myApproval:", myApproval);

  // Only show the buttons if the logged-in user has a pending approval
  const canTakeAction = isApproval && myApproval;

  // Check if this approval has already been handled (approved/rejected)
  const isAlreadyHandled =
    myApproval?.status === PermitStatus.APPROVED ||
    myApproval?.status === PermitStatus.REJECTED;

  // --- Approval Actions ---
  // async function handleApprovalAction(action: "APPROVED" | "REJECTED") {
  //   try {
  //     if (!approvals || approvals.length === 0) {
  //       Alert.alert("Error", "No approval record found.");
  //       return;
  //     }

      
  //     console.log("approvalData:", approvalData);
  //     console.log("workflowDataId:", permit.workflowDataId);

  //     // Find the current approver (from approvals)
  //     const myApproval = approvals.find(a => a.status === PermitStatus.PENDING);

  //     if (!myApproval) {
  //       Alert.alert("Error", "No pending approval found for you.");
  //       return;
  //     }

  //     // Find the corresponding approval-data record
  //     const myApprovalData = approvalData.find(
  //       ad => ad.approval_id === myApproval.id &&
  //             ad.workflow_data_id === permit.workflowDataId
  //     );

  //     if (!myApprovalData) {
  //       Alert.alert("Error", "ApprovalData record not found for this approver.");
  //       return;
  //     }

  //     // Use approvalData.id for PATCH
  //     const payload = {
  //       ...myApprovalData,
  //       status: action,
  //       time: new Date().toISOString(),
  //     };

  //     const res = await fetch(`${API_BASE_URL}api/approval-data/${myApprovalData.id}/`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       const text = await res.text();
  //       throw new Error(text);
  //     }

  //     Alert.alert("Success", `Permit ${action.toLowerCase()} successfully!`);
  //     refetch();
  //   } catch (err: any) {
  //     console.error("Approval update failed:", err);
  //     Alert.alert("Error", err.message || "Failed to update status");
  //   }
  // }

  async function handleApprovalAction(action: "APPROVED" | "REJECTED") {
    try {
      if (!approvals || approvals.length === 0) {
        Alert.alert("Error", "No approval record found.");
        return;
      }

      console.log("approvalData:", approvalData);
      console.log("workflowDataId:", permit.workflowDataId);

      // Find the current approver (the one who is pending)
      const myApproval = approvals.find(a => a.status === PermitStatus.PENDING);

      if (!myApproval) {
        Alert.alert("Error", "No pending approval found for you.");
        return;
      }

      // Find this approver's ApprovalData entry
      const myApprovalData = approvalData.find(
        ad => ad.approval_id === myApproval.id &&
              ad.workflow_data_id === permit.workflowDataId
      );

      if (!myApprovalData) {
        Alert.alert("Error", "ApprovalData record not found for this approver.");
        return;
      }

      // Update current approver’s status
      const payload = {
        ...myApprovalData,
        status: action,
        time: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE_URL}api/approval-data/${myApprovalData.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      // If approved, promote next approver
      if (action === "APPROVED") {
        const nextApproval = approvals.find(
          a => a.level === myApproval.level + 1
        );

        if (nextApproval) {
          const nextApprovalData = approvalData.find(
            ad => ad.approval_id === nextApproval.id &&
                  ad.workflow_data_id === permit.workflowDataId
          );

          if (nextApprovalData && nextApprovalData.status === "WAITING") {
            const nextPayload = {
              ...nextApprovalData,
              status: "PENDING",
              time: new Date().toISOString(),
            };

            const nextRes = await fetch(`${API_BASE_URL}api/approval-data/${nextApprovalData.id}/`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextPayload),
            });

            if (!nextRes.ok) {
              console.warn("Failed to promote next approver");
            }
          }
        } else {
          console.log("Final approval completed (no next approver).");
        }
      }

      // If rejected, you could stop workflow (optional)
      if (action === "REJECTED") {
        console.log("Permit rejected. Workflow will not proceed.");
      }

      Alert.alert("Success", `Permit ${action.toLowerCase()} successfully!`);
      refetch();
    } catch (err: any) {
      console.error("Approval update failed:", err);
      Alert.alert("Error", err.message || "Failed to update status");
    }
  }

  function confirmAction(action: "APPROVED" | "REJECTED") {
    Alert.alert(
      action === "APPROVED" ? "Approve Permit" : "Reject Permit",
      `Confirm to ${action.toLowerCase()} this permit?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => handleApprovalAction(action) },
      ]
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Permit Details",
          headerTitleAlign: "left",
          headerShown: true,
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
        }}
      />

      <ScrollView className="flex-1 p-4 bg-gray-100">
        {/* Permit Summary */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Details</Text>

          {/* Permit internal status */}
          <Text className="text-base text-primary mb-2">
            Permit Name:{" "}
            <Text className="font-semibold">{permit.name || "-"}</Text>
          </Text>

          <Text className="text-base text-primary mb-2">
            Permit Status:{" "}
            <Text className={getStatusClass(permit.status)}>
              {permit.status || "-"}
            </Text>
          </Text>

          <Text className="text-base text-primary mb-2">
            Applicant Name:{" "}
            <Text className="font-semibold">{permit.applicantName || "-"}</Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Location: <Text className="font-semibold">{permit.location || "-"}</Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Permit Type:{" "}
            <Text className="font-semibold">{permit.permitType || "-"}</Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Work Start:{" "}
            <Text className="font-semibold">
              {permit.workStartTime ? formatDate(permit.workStartTime) : "-"}
            </Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Work End:{" "}
            <Text className="font-semibold">
              {permit.workEndTime ? formatDate(permit.workEndTime) : "-"}
            </Text>
          </Text>
          <Text className="text-base text-primary mb-2">
            Created:{" "}
            <Text className="font-semibold">
              {permit.createdTime ? formatDate(permit.createdTime) : "-"}
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
              className={`px-3 py-2 rounded ${
                permit.documentUrl ? "bg-primary" : "bg-gray-400"
              }`}
            >
              <Text className="text-white text-sm font-semibold">Download</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Approvals */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Approvals</Text>

          {Array.isArray(approvals) && approvals.length > 0 ? (
            approvals.map((a, idx) => (
              <View
                // key={a.id || idx}
                key={`${a.id}-${a.user_id || 'unknown'}-${idx}`}
                className="border-b border-gray-200 pb-3 mb-3"
              >
                <Text className="text-base text-primary mb-1">
                  Role:{" "}
                  <Text className="font-semibold">
                    {a.role_name || a.roleName || "Role"}
                  </Text>
                </Text>

                <Text className="text-base text-primary mb-1">
                  Approver:{" "}
                  <Text className="font-semibold">{a.approver_name || "Unknown"}</Text>
                </Text>

                <Text className="text-base text-primary mb-1">
                  Status:{" "}
                  <Text className={getStatusClass(a.status)}>
                    {a.status || PermitStatus.PENDING}
                  </Text>
                </Text>

                <Text className="text-base text-primary mb-0">
                  Time:{" "}
                  <Text className="font-semibold">
                    {a.time ? formatDate(a.time) : "-"}
                  </Text>
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 italic">No approvals yet</Text>
          )}
        </View>

        {/* Approval Buttons */}
        {canTakeAction && (
          <>
          <View>
            {isAlreadyHandled && (
              <Text className="text-gray-600 italic mt-3">
                You have already {myApproval?.status.toLowerCase()} this permit.
              </Text>
            )}
          </View>
          <View className="flex-row my-6">
            <Pressable
              disabled={isAlreadyHandled}
              onPress={() => confirmAction(PermitStatus.REJECTED)}
              className={`flex-1 py-3 mr-3 rounded-xl items-center ${
                isAlreadyHandled
                  ? "bg-gray-400"
                  : "bg-rejected"

              }`}
            >
              <Text className="text-white font-semibold text-base">
                Reject
              </Text>
            </Pressable>

            <Pressable
              disabled={isAlreadyHandled}
              onPress={() => confirmAction(PermitStatus.APPROVED)}
              className={`flex-1 py-3 rounded-xl items-center ${
                isAlreadyHandled
                  ? "bg-gray-400"
                  : "bg-approved"
              }`}
            >
              <Text className="text-white font-semibold text-base">
                Approve
              </Text>
            </Pressable>
          </View>
          
          </>
        )}
        <View className="p-5" />
      </ScrollView>
    </>
  );
}


  // async function handleApprovalAction(action: "APPROVED" | "REJECTED") {
  //   try {
  //     if (!approvals || approvals.length === 0) {
  //       Alert.alert("Error", "No approval record found.");
  //       return;
  //     }

  //     const myApproval = approvals.find(a => a.status === PermitStatus.PENDING);
  //     const isAlreadyHandled =
  //       myApproval?.status === PermitStatus.APPROVED ||
  //       myApproval?.status === PermitStatus.REJECTED;
  //     if (!myApproval) {
  //       Alert.alert("Error", "No pending approval found for you.");
  //       return;
  //     }

  //     const payload = {
  //       company_id: myApproval.company_id || permit.company_id || 1,
  //       approval_id: myApproval.id,
  //       document_id: permit.documentId || 0,
  //       workflow_data_id: permit.workflowDataId || 0,
  //       status: action,
  //       approver_name: myApproval.approver_name || "Unknown",
  //       time: new Date().toISOString(),
  //       role_name: myApproval.role_name || "Approver",
  //       level: myApproval.level || 1,
  //     };

  //     const res = await fetch(`${API_BASE_URL}api/approval-data/${myApproval.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       const text = await res.text();
  //       throw new Error(text);
  //     }

  //     Alert.alert("Success", `Permit ${action.toLowerCase()} successfully!`);
  //     refetch();
  //   } catch (err: any) {
  //     console.error("Approval update failed:", err);
  //     Alert.alert("Error", err.message || "Failed to update status");
  //   }
  // }