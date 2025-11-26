import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newWorkEndTime, setNewWorkEndTime] = useState(new Date());
  
  const [canExtend, setCanExtend] = useState(false);
  const [extensionReason, setExtensionReason] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (permit?.workEndTime) {
      setNewWorkEndTime(new Date(permit.workEndTime));
    }
  }, [permit?.workEndTime]);

  useEffect(() => {
    const checkEligibility = async () => {
      // Reset state on check
      setCanExtend(false);
      setExtensionReason(null);

      if (permit?.id && userId === permit?.applicantId) {
        try {
          const { eligible, reason } = await api.checkExtensionEligibility(permit.id);
          setCanExtend(eligible);
          setExtensionReason(reason);
        } catch (e) { setCanExtend(false); }
      }
    };
    checkEligibility();
  }, [permit?.id, permit?.applicantId, userId, permit?.status]); // Re-check if status changes

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
  
  const now = new Date();
  const workStartTime = permit.workStartTime ? new Date(permit.workStartTime) : null;
  const workEndTime = permit.workEndTime ? new Date(permit.workEndTime) : null;
  const isWithinWorkWindow = workStartTime && workEndTime && now >= workStartTime && now <= workEndTime;

  const canConfirmSecurity = permit.status === PermitStatus.APPROVED && isWithinWorkWindow;

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

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false); // Always hide date picker
    if (event.type === "set") {
      const currentDate = selectedDate || newWorkEndTime;
      setNewWorkEndTime(currentDate);
      setShowTimePicker(true); // Show time picker next
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false); // Always hide time picker
    if (event.type === "set") {
      const selectedTime = selectedDate || newWorkEndTime;
      const finalDate = new Date(newWorkEndTime); // Start with the date part

      // Apply the new time
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      finalDate.setSeconds(selectedTime.getSeconds());

      handleExtendPermit(finalDate);
    }
  }

  async function handleExtendPermit(date: Date) {
    if (!permit?.workflowDataId) return Alert.alert("Error", "Workflow data ID not found.");
    if (date <= new Date(permit.workEndTime)) {
      return Alert.alert("Invalid Date", "New end time must be later than the current one.");
    }
    try {
      await api.extendWorkEndTime(permit.workflowDataId, date.toISOString());
      Alert.alert("Success", "Work end time has been extended.");
      refetch();
    } catch (error: any) {
      console.error("Failed to extend permit:", error.message || error);
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
              disabled={!permit.documentId}
              onPress={() => permit.documentId && downloadDocument(permit.documentId, permit.document)}
              className={`px-3 py-2 rounded ${permit.documentId ? "bg-primary" : "bg-gray-400"}`}
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
            <View className="flex-row flex-wrap">
              {permit.safety_equipment.map((item: any) => (
                <View key={item.id} className="bg-blue-100 rounded-lg px-3 py-2 mr-2 mb-2">
                  <Text className="text-blue-800 text-sm font-medium">{item.name}</Text>
                </View>
              ))}
            </View>
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

        {/* Extend Permit Button */}
        {userId === permit?.applicantId && canExtend && (
          <View className="my-6">
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="py-3 rounded-xl items-center bg-blue-600"
            >
              <Text className="text-white font-medium">Extend Work End Time</Text>
            </Pressable>
          </View>
        )}

        {/* Reason for disabled extend button */}
        {userId === permit?.applicantId && !canExtend && extensionReason && (
          <Text className="text-center text-sm text-gray-600 mt-2 italic">{extensionReason}</Text>
        )}

        {/* DateTime Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={newWorkEndTime}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={workEndTime ? new Date(workEndTime) : new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={newWorkEndTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onTimeChange}
            minimumDate={workEndTime ? new Date(workEndTime) : new Date()}
          />
        )}

        {/* Security button */}
        {isSecurity && (
          <View className="my-6">
            <Pressable
              onPress={handleSecurityConfirm}
              disabled={!canConfirmSecurity || loading}
              className={`py-3 rounded-xl items-center ${!canConfirmSecurity || loading ? 'bg-gray-400' : 'bg-primary'}`}
            >
              <Text className="text-white font-medium">Confirm Entry</Text>
            </Pressable>
            {!canConfirmSecurity && permit.status === PermitStatus.APPROVED && !isWithinWorkWindow && (
              <Text className="text-center text-sm text-gray-600 mt-2">You can only confirm entry within the scheduled work window.</Text>
            )}
            {permit.status === PermitStatus.ACTIVE && (
              <Text className="text-center text-sm text-gray-600 mt-2">Entry has been confirmed for this permit.</Text>
            )}
          </View>
        )}
        <View className="p-5" />
      </ScrollView>
    </SafeAreaView>
  );
}