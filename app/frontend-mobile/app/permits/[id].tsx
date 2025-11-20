import React, { useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { usePermitDetails } from "@/hooks/usePermitDetails";
import { useUser } from "@/contexts/UserContext";
import { downloadDocument } from "@/utils/download";
import { getStatusClass } from "@/utils/class";
import { formatDate } from "@/utils/date";
import { PermitStatus } from "@/constants/Status";
import * as api from "@/services/api";
import { Colors } from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import WorkerTable from "@/components/WorkerTable";
import { TextInput } from "react-native";

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { permit, approvals, approvalData, loading, error, refetch } = usePermitDetails(id as string);
  const { userId, isApproval, isSecurity } = useUser();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredWorkers = useMemo(() => {
    let list = permit?.workers || [];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((worker: any) => (worker.name || '').toLowerCase().includes(term) || (worker.ic_passport || '').toLowerCase().includes(term) || (worker.position || '').toLowerCase().includes(term));
    }

    return list;
  }, [permit?.workers, search]);

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

  const myApproval = approvals?.find(a => a.user_id === userId && a.status === PermitStatus.PENDING);
  const canTakeAction = isApproval && myApproval;
  const isAlreadyHandled = myApproval?.status === PermitStatus.APPROVED || myApproval?.status === PermitStatus.REJECTED;
  const canConfirmSecurity = isSecurity;

  async function handleApprovalAction(action: "APPROVED" | "REJECTED") {
    if (!myApproval) return Alert.alert("Error", "No pending approval found for you.");
    const myApprovalData = approvalData.find(ad => ad.approval_id === myApproval.id && ad.workflow_data_id === permit.workflowDataId);
    if (!myApprovalData) return Alert.alert("Error", "ApprovalData record not found.");

    try {
      await api.updateApprovalData({ ...myApprovalData, status: action, time: new Date().toISOString() });

      if (action === "APPROVED") {
        const nextApproval = approvals.find(a => a.level === myApproval.level + 1);
        if (nextApproval) {
          const nextApprovalData = approvalData.find(ad => ad.approval_id === nextApproval.id && ad.workflow_data_id === permit.workflowDataId);
          if (nextApprovalData && nextApprovalData.status === "WAITING") {
            await api.updateApprovalData({ ...nextApprovalData, status: "PENDING", time: new Date().toISOString() });
          }
        }
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
      [{ text: "Cancel", style: "cancel" }, { text: "Yes", onPress: () => handleApprovalAction(action) }]
    );
  }

  async function handleSecurityConfirm() {
    try {
      await api.confirmSecurity(permit.id);
      Alert.alert("Success", "Security confirmation successful");
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Security confirmation failed");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <CustomHeader
        title="Permit Details"
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Permit Summary */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Details</Text>
          <Text className="text-base text-primary mb-2">Permit Name: <Text className="font-semibold">{permit.name || "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Permit Status: <Text className={getStatusClass(permit.status)}>{permit.status || "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Applicant Name: <Text className="font-semibold">{permit.applicantName || "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Location: <Text className="font-semibold">{permit.location || "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Permit Type: <Text className="font-semibold">{permit.permitType || "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Work Start: <Text className="font-semibold">{permit.workStartTime ? formatDate(permit.workStartTime) : "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Work End: <Text className="font-semibold">{permit.workEndTime ? formatDate(permit.workEndTime) : "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Created: <Text className="font-semibold">{permit.createdTime ? formatDate(permit.createdTime) : "-"}</Text></Text>
          <Text className="text-base text-primary mb-2">Workflow: <Text className="font-semibold">{permit.workflowData || "-"}</Text></Text>
        </View>

        {/* Attachments */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Attachments</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-primary">Document: <Text className="font-semibold">{permit.document}</Text></Text>
            <TouchableOpacity
              disabled={!permit.documentUrl}
              onPress={() => permit.documentUrl && downloadDocument(permit.documentUrl, permit.document)}
              className={`px-3 py-2 rounded ${permit.documentUrl ? "bg-primary" : "bg-gray-400"}`}
            >
              <Text className="text-white text-sm font-semibold">Download</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workers */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Workers</Text>
          <TextInput
            placeholder="Search by name, IC, or position..."
            value={search}
            onChangeText={setSearch}
            className="bg-secondary p-3 rounded-lg text-primary mb-4"
          />


          {filteredWorkers.length > 0 ? (
            <WorkerTable
              workers={filteredWorkers}
              isEditable={false}
              handleDeleteWorker={() => {}}
            />
          ) : (            
            <Text className="text-gray-500 italic">No workers assigned</Text>
          )}
        </View>

        {/* Safety Equipment */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Safety Equipment</Text>
          {permit.safety_equipment && permit.safety_equipment.length > 0 ? (
            permit.safety_equipment.map((item: any) => (
              <View key={item.id} className="border-b border-gray-200 pb-2 mb-2">
                <Text className="text-base text-primary">{item.name}</Text>
              </View>
            ))
          ) : <Text className="text-gray-500 italic">No safety equipment required</Text>}
        </View>

        {/* Approvals */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold text-primary mb-3">Approvals</Text>
          {approvals.length > 0 ? (
            approvals.map((a, idx) => (
              <View key={`${a.id}-${a.user_id || 'unknown'}-${idx}`} className="border-b border-gray-200 pb-3 mb-3">
                <Text className="text-base text-primary mb-1">Role: <Text className="font-semibold">{a.role_name || a.roleName || "Role"}</Text></Text>
                <Text className="text-base text-primary mb-1">Approver: <Text className="font-semibold">{a.approver_name || "Unknown"}</Text></Text>
                <Text className="text-base text-primary mb-1">Status: <Text className={getStatusClass(a.status)}>{a.status || PermitStatus.PENDING}</Text></Text>
                <Text className="text-base text-primary mb-0">Time: <Text className="font-semibold">{a.time ? formatDate(a.time) : "-"}</Text></Text>
              </View>
            ))
          ) : <Text className="text-gray-500 italic">No approvals yet</Text>}
        </View>

        {/* Approval Buttons */}
        {canTakeAction && (
          <>
            {isAlreadyHandled && <Text className="text-gray-600 italic mt-3">You have already {myApproval?.status.toLowerCase()} this permit.</Text>}
            <View className="flex-row my-6">
              <Pressable disabled={isAlreadyHandled} onPress={() => confirmAction(PermitStatus.REJECTED)} className={`flex-1 py-3 mr-3 rounded-xl items-center ${isAlreadyHandled ? "bg-gray-400" : "bg-rejected"}`}>
                <Text className="text-white font-semibold text-base">Reject</Text>
              </Pressable>
              <Pressable disabled={isAlreadyHandled} onPress={() => confirmAction(PermitStatus.APPROVED)} className={`flex-1 py-3 rounded-xl items-center ${isAlreadyHandled ? "bg-gray-400" : "bg-approved"}`}>
                <Text className="text-white font-semibold text-base">Approve</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Security button */}
        {canConfirmSecurity && (
          <View className="my-6">
            <Pressable onPress={handleSecurityConfirm} className="py-3 rounded-xl items-center bg-primary">
              <Text className="text-white font-medium">{permit.status === PermitStatus.ACTIVE ? "Confirm Exit" : "Confirm Entry"}</Text>
            </Pressable>
          </View>
        )}
        <View className="p-5" />
      </ScrollView>
    </SafeAreaView>
  );
}