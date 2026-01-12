import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  Modal,
  RefreshControl,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { usePermitDetails } from "@/hooks/usePermitDetails";
import { useUser } from "@/contexts/UserContext";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import { downloadDocument } from "@/utils/download";
import { getStatusClass } from "@/utils/class";
import { formatDate } from "@/utils/date";
import { PermitStatus } from "@/constants/Status";
import { getMimeType } from "@/utils/file";
// import * as api from "@/services/api";
import * as api from "../../../shared/services/api";
import { Colors } from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import WorkerTable from "@/components/WorkerTable";
import { TextInput } from "react-native";
// import Constants from "expo-constants";
import * as Linking from "expo-linking";

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { 
    permit, approvals, approvalData, loading, error, refetch, 
    confirmEntryAndCreateClosingWorkflow, serverTime 
  } = usePermitDetails(id as string);
  const { userId, isApproval, isSecurity } = useUser();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newWorkEndTime, setNewWorkEndTime] = useState(new Date());
  
  const [remarksModalVisible, setRemarksModalVisible] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [extension, setExtension] = useState(false);
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
      setExtension(false);
      setExtensionReason(null);

      if (permit?.id && userId === permit?.applicantId) {
        try {
          const { eligible, reason } = await api.checkExtensionEligibility(permit.id);
          setExtension(eligible);
          setExtensionReason(reason);
        } catch (e) { setExtension(false); }
      }
    };
    checkEligibility();
  }, [permit?.id, permit?.applicantId, userId, permit?.status]); // Re-check if status changes

  const filteredWorkers = useMemo(() => {
    let list = permit?.workers || [];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((worker: any) => 
        (worker.name || '').toLowerCase().includes(term) || 
        (worker.ic_passport || '').toLowerCase().includes(term) || 
        (worker.position || '').toLowerCase().includes(term)
      );
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
  const isAlreadyHandled = myApproval?.status === PermitStatus.APPROVED || myApproval?.status === PermitStatus.REJECTED;
  
  const now = serverTime ? new Date(serverTime) : new Date();
  const workStartTime = permit.workStartTime ? new Date(permit.workStartTime) : null;
  const workEndTime = permit.workEndTime ? new Date(permit.workEndTime) : null;
  const isWithinWorkWindow = workStartTime && workEndTime && now >= workStartTime && now <= workEndTime;

  const canExtend = userId === permit?.applicantId && extension;
  const canApproveReject = isApproval && myApproval; // && myApproval.level < 98;
  const canConfirmSecurity = isSecurity && permit.status === PermitStatus.APPROVED;
  const canConfirmJobDone = isApproval && permit.status === PermitStatus.ACTIVE && myApproval; // && myApproval.level === 98;
  const canConfirmExit = isSecurity && permit.status === PermitStatus.EXIT_PENDING;

  const mimeType = getMimeType(permit.document);
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

  // ---------------------- Button handlers ----------------------

  async function handleApprovalAction(action: "APPROVED" | "REJECTED", remarksText?: string) {
    if (!myApproval) return crossPlatformAlert("Error", "No pending approval found for you.");
    const myApprovalData = approvalData.find(ad => ad.approval_id === myApproval.id && ad.workflow_data_id === permit.workflowDataId);
    if (!myApprovalData) return crossPlatformAlert("Error", "ApprovalData record not found.");

    await updateStatus(myApprovalData, action, remarksText);
  }

  async function handleSecurityConfirm() {
    try {
      // This function handles creating the closing workflow and activating the permit
      await confirmEntryAndCreateClosingWorkflow();

      crossPlatformAlert("Success", "Permit has been activated and is now ACTIVE.");
      refetch();
    } catch (err: any) {
      crossPlatformAlert("Error", err.message || "Failed to progress permit.");
    }
  }

  async function handleExtendPermit(date: Date) {
    if (!permit?.workflowDataId) return crossPlatformAlert("Error", "Workflow data ID not found.");
    if (date <= new Date(permit.workEndTime)) {
      return crossPlatformAlert("Invalid Date", "New end time must be later than the current one.");
    }
    try {
      await api.extendWorkEndTime(permit.workflowDataId, date.toISOString());
      crossPlatformAlert("Success", "Work end time has been extended.");
      refetch();
    } catch (error: any) {
      console.error("Failed to extend permit:", error.message || error);
    }
  }

  async function handleJobDoneConfirm() {
    if (!myApproval) return crossPlatformAlert("Error", "Job Done approval not found for you.");
    const jobDoneApprovalData = approvalData.find(ad => ad.approval_id === myApproval.id && ad.workflow_data_id === permit.workflowDataId);
    if (!jobDoneApprovalData) return crossPlatformAlert("Error", "ApprovalData for Job Done not found.");

    try {
      // First, update the approval data record to mark it as done
      await updateStatus(jobDoneApprovalData, PermitStatus.APPROVED);
      // Then, call the new endpoint to change the permit status to EXIT_PENDING
      await api.confirmJobDone(permit.id);
      crossPlatformAlert("Success", "Job done confirmed. Permit is now awaiting exit confirmation from security.");
      refetch();
    } catch (err: any) {
      crossPlatformAlert("Error", err.message || "Failed to confirm job done.");
    }
  }

  async function handleExitConfirm() {
    // This action will complete the permit via the dedicated security endpoint.
    await api.securityConfirmExit(permit.id);
    crossPlatformAlert("Success", "Permit completed successfully!");
    refetch();
  }

  async function updateStatus(approvalDataToUpdate: any, action: "APPROVED" | "REJECTED", remarksText?: string) {
    if (!approvalDataToUpdate) return crossPlatformAlert("Error", "Approval data to update is missing.");

    try {
      const payload: any = {
        ...approvalDataToUpdate,
        status: action,
        time: new Date().toISOString(),
      };

      if (action === "REJECTED" && remarksText) {
        payload.remarks = remarksText;
      }
      await api.updateApprovalData(payload);

      crossPlatformAlert("Success", `Permit ${action.toLowerCase()} successfully!`);
      setRemarksModalVisible(false);
      setRemarks("");
      refetch();
    } catch (err: any) {
      console.error("Approval update failed:", err);
      crossPlatformAlert("Error", err.message || "Failed to update status");
    }
  }

  function confirmApproveReject(action: "APPROVED" | "REJECTED") {
    if (action === "REJECTED") {
      setRemarksModalVisible(true);
    } else {
      crossPlatformAlert(
        "Approve Permit",
        "Confirm to approve this permit?",
        [{ text: "Cancel", style: "cancel" }, { text: "Yes", onPress: () => handleApprovalAction(action) }]
      );
    }
  }

  function confirmJobDoneAction() {
    crossPlatformAlert("Confirm Job Done", "Are you sure the job is completed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: handleJobDoneConfirm },
    ]);
  }

  function confirmExitAction() {
    crossPlatformAlert("Confirm Exit", "Confirm exit for all workers and complete the permit?", [
      { text: "Cancel", style: "cancel" }, 
      { text: "Yes", onPress: handleExitConfirm },
    ]);
  }

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false); // Always hide time picker
    if (event.type === "set") {
      const selectedTime = selectedDate || newWorkEndTime;
      // Start with the original work end time to preserve the correct date
      const finalDate = new Date(permit.workEndTime); 

      // Apply the new time
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      finalDate.setSeconds(selectedTime.getSeconds());

      handleExtendPermit(finalDate);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <CustomHeader
        title="Permit Details"
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
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
            <Text className="text-base text-primary flex-1" numberOfLines={1}>
              Document: <Text className="font-semibold">{permit.document}</Text>
            </Text>
            <View className="flex-row">
              {!isOffice && (
                <TouchableOpacity
                  disabled={!permit.documentId || isOffice}
                  className={`px-3 py-2 rounded mr-2 ${permit.documentId ? "bg-blue-600" : "bg-gray-400"}`}
                  onPress={() => {
                    if (!permit.documentId || isOffice) return;

                    // const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
                    const fileUrl = `${api.API_BASE_URL}api/documents/${permit.documentId}/view`;

                    if (Platform.OS === "android") {
                      Linking.openURL(fileUrl);
                      return;
                    }

                    router.push({
                      pathname: "/permits/fileViewer",
                      params: {
                        fileUrl,
                        fileName: permit.document,
                        fileType: mimeType,
                      },
                    });
                  }}
                >
                  <Text className="text-white text-sm font-semibold">View</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                disabled={!permit.documentId}
                onPress={() => permit.documentId && downloadDocument(permit.documentId, permit.document)}
                className={`px-3 py-2 rounded ${permit.documentId ? "bg-primary" : "bg-gray-400"}`}
              >
                <Text className="text-white text-sm font-semibold">Download</Text>
              </TouchableOpacity>
            </View>
          </View>
          {isOffice && (
            <Text className="text-xs text-rejected mt-1">
              No Preview. Office documents must be downloaded to view.
            </Text>
          )}
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
                {a.remarks && <Text className="text-base text-primary mb-1">Remarks: <Text className="font-normal text-rejected italic">{a.remarks}</Text></Text>}
                <Text className="text-base text-primary">Time: <Text className="font-semibold">{a.time ? formatDate(a.time) : "-"}</Text></Text>
              </View>
            ))
          ) : <Text className="text-gray-500 italic">No approvals yet</Text>}
        </View>

        {/* ---------------------------------- Action Buttons ------------------------------- */}

        {/* Job Done Button (Supervisor) */}
        {canConfirmJobDone && (
          <View className="my-6">
            <Pressable onPress={confirmJobDoneAction} className="py-3 rounded-xl items-center bg-green-600">
              <Text className="text-white font-semibold text-base">Confirm Job Done</Text>
            </Pressable>
          </View>
        )}

        {/* Approval Buttons */}
        {canApproveReject && (
          <>
            {isAlreadyHandled && <Text className="text-gray-600 italic mt-3">You have already {myApproval?.status.toLowerCase()} this permit.</Text>}
            <View className="flex-row my-6">
              <Pressable 
                disabled={isAlreadyHandled}
                onPress={() => confirmApproveReject(PermitStatus.REJECTED)} 
                className={`flex-1 py-3 mr-3 rounded-xl items-center ${isAlreadyHandled ? "bg-gray-400" : "bg-rejected"}`}
              >
                <Text className="text-white font-semibold text-base">Reject</Text>
              </Pressable>
              <Pressable 
                disabled={isAlreadyHandled} 
                onPress={() => confirmApproveReject(PermitStatus.APPROVED)}
                className={`flex-1 py-3 rounded-xl items-center ${isAlreadyHandled ? "bg-gray-400" : "bg-approved"}`}
              >
                <Text className="text-white font-semibold text-base">Approve</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Remarks Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={remarksModalVisible}
          onRequestClose={() => setRemarksModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50 p-4">
            <View className="bg-white rounded-xl p-6 w-full">
              <Text className="text-lg font-bold text-primary mb-4">Add Rejection Remarks</Text>
              <TextInput
                placeholder="Please provide a reason for rejection..."
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={4}
                className="bg-secondary p-3 rounded-lg text-primary mb-6 h-24"
                textAlignVertical="top"
              />
              <View className="flex-row justify-end">
                <TouchableOpacity onPress={() => setRemarksModalVisible(false)} className="px-4 py-2 mr-2"><Text className="text-gray-600">Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleApprovalAction("REJECTED", remarks)} className="bg-rejected px-4 py-2 rounded-lg"><Text className="text-white font-semibold">Submit Rejection</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Extend Permit Button */}
        {canExtend && (
          <View className="my-6">
            <Pressable
              onPress={() => setShowTimePicker(true)}
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
        {canConfirmSecurity && (
          <View className="mt-6">
            <Pressable
              onPress={handleSecurityConfirm}
              disabled={!canConfirmSecurity || loading}
              className={`py-3 rounded-xl items-center ${!canConfirmSecurity || loading ? 'bg-gray-400' : 'bg-primary'}`}
            >
              <Text className="text-white font-medium">Confirm Entry</Text>
            </Pressable>
            {!isWithinWorkWindow && (
              <Text className="text-center text-sm text-gray-600 mt-2">You can only confirm entry within the scheduled work window.</Text>
            )}
            {permit.status === PermitStatus.ACTIVE && (
              <Text className="text-center text-sm text-gray-600 mt-2">Entry has been confirmed for this permit.</Text>
            )}
          </View>
        )}

        {/* Exit Button (Security) */}
        {canConfirmExit && (
          <View className="my-6">
            <Pressable
              onPress={confirmExitAction}
              className={`py-3 rounded-xl items-center bg-red-500`}>
              <Text className="text-white font-medium">Confirm Exit & Complete Permit</Text>
            </Pressable>
            <Text className="text-center text-sm text-gray-600 mt-2">This will mark the permit as COMPLETED.</Text>
          </View>
        )}
        <View className="p-5" />
      </ScrollView>
    </SafeAreaView>
  );
}