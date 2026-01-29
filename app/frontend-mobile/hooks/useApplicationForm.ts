import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  fetchPermitTypes,
  fetchLocations,
  fetchWorkers,
  fetchSafetyEquipment,
  uploadDocument,
  createWorker,
  createSafetyEquipment,
  createWorkflow,
  createWorkflowData,
  saveApplication,
  fetchUsersByGroupName,
  createApproval,
  createApprovalData,
  fetchPermitOfficersByPermitType,
  fetchLocationManagersByLocation,
  downloadDocumentById,
  sendNotificationToUser,
} from "../../shared/services/api";
import Constants from "expo-constants";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import { useUser } from "@/contexts/UserContext";
import { PermitStatus } from "@/constants/Status";

const APPROVER_GROUP_NAME = Constants.expoConfig?.extra?.APPROVER_GROUP_NAME || process.env.EXPO_PUBLIC_APPROVER_GROUP_NAME || "Supervisor";
const PLACEHOLDER_THRESHOLD = 3;
const PLACEHOLDER_ID = 1;

export function useApplicationForm(existingApp: any, router: any) {
  const { userId, userName, companyId: userCompanyId } = useUser();

  const [applicantName, setApplicantName] = useState(existingApp?.createdBy || "");
  const [permitName, setPermitName] = useState(existingApp?.name || "");

  // Show "No document uploaded" if documentId is placeholder
  const [documentId, setDocumentId] = useState<number | null>(
    existingApp?.documentId && existingApp.documentId > PLACEHOLDER_THRESHOLD
      ? existingApp.documentId
      : null
  );
  const [documentName, setDocumentName] = useState<string | null>(
    existingApp?.documentId && existingApp.documentId > PLACEHOLDER_THRESHOLD
      ? existingApp.document
      : "No document uploaded"
  );

  const [uploading, setUploading] = useState(false);

  const [permitTypeOpen, setPermitTypeOpen] = useState(false);
  const [permitType, setPermitType] = useState<number | null>(existingApp?.permitTypeId || null);
  const [permitTypeItems, setPermitTypeItems] = useState<{ label: string; value: number }[]>([]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<number | null>(existingApp?.locationId || null);
  const [locationItems, setLocationItems] = useState<{ label: string; value: number }[]>([]);

  const [jobAssignerOpen, setJobAssignerOpen] = useState(false);
  const [jobAssigner, setJobAssigner] = useState<number | null>(existingApp?.jobAssignerId || null);
  const [jobAssignerItems, setJobAssignerItems] = useState<{ label: string; value: number }[]>([]);

  const [workersOpen, setWorkersOpen] = useState(false);
  const [workerIds, setWorkerIds] = useState<number[]>([]);
  const [workerItems, setWorkerItems] = useState<{ label: string; value: number }[]>([]);

  const [safetyEquipmentOpen, setSafetyEquipmentOpen] = useState(false);
  const [safetyEquipmentIds, setSafetyEquipmentIds] = useState<number[]>([]);
  const [safetyEquipmentItems, setSafetyEquipmentItems] = useState<{ label: string; value: number }[]>([]);

  const [startTime, setStartTime] = useState<Date | null>(
    existingApp?.workStartTime ? new Date(existingApp.workStartTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    existingApp?.workEndTime ? new Date(existingApp.workEndTime) : null
  );

  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state

  // Fetch dropdown data once
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const typeData = await fetchPermitTypes();
        setPermitTypeItems(
          typeData
            .filter((t: any) => t.id > PLACEHOLDER_THRESHOLD)
            .map((t: any) => ({ label: t.name, value: t.id }))
        );

        const locData = await fetchLocations();
        setLocationItems(
          locData
            .filter((l: any) => l.id > PLACEHOLDER_THRESHOLD)
            .map((l: any) => ({ label: l.name, value: l.id }))
        );

        const approversData = await fetchUsersByGroupName(APPROVER_GROUP_NAME);
        setJobAssignerItems(
          approversData
            .filter((u: any) => u.id > PLACEHOLDER_THRESHOLD)
            .map((u: any) => ({ label: u.name, value: u.id }))
        );

        // Fetch workers for the current user's company
        if (userCompanyId) {
          const workersData = await fetchWorkers(userCompanyId);
          setWorkerItems(
            workersData.map((w: any) => ({ label: w.name, value: w.id }))
          );
        }

        // Fetch all safety equipment
        const equipmentData = await fetchSafetyEquipment();
        setSafetyEquipmentItems(
          equipmentData.map((e: any) => ({ label: e.name, value: e.id }))
        );

        if (userId) {
          const currentUser = approversData.find((u: any) => u.id === userId);
          setApplicantName(currentUser?.name || "Unknown User");
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      } finally {
        // Stop loading regardless of outcome
        // Removing this line causes infinite loading state if an error occurs
        setLoading(false); 
      }
    }
    fetchData();
  }, [userId, userCompanyId]);

  // Initialize values from existing application after dropdowns load
  useEffect(() => {
    if (!existingApp || initialized) return;
    if (
      permitTypeItems.length === 0 ||
      locationItems.length === 0 ||
      jobAssignerItems.length === 0 ||
      workerItems.length === 0 ||
      safetyEquipmentItems.length === 0
    )
      return;

    setPermitType(
      existingApp.permitTypeId && existingApp.permitTypeId > PLACEHOLDER_THRESHOLD
        ? Number(existingApp.permitTypeId)
        : null
    );
    setLocation(
      existingApp.locationId && existingApp.locationId > PLACEHOLDER_THRESHOLD
        ? Number(existingApp.locationId)
        : null
    );
    setJobAssigner(
      existingApp.jobAssignerId && existingApp.jobAssignerId > PLACEHOLDER_THRESHOLD
        ? Number(existingApp.jobAssignerId)
        : null
    );
    setWorkerIds(Array.isArray(existingApp.worker_ids) ? existingApp.worker_ids : []);
    setSafetyEquipmentIds(Array.isArray(existingApp.safety_equipment_ids) ? existingApp.safety_equipment_ids : []);

    // Reset document placeholders
    if (!existingApp.documentId || existingApp.documentId <= PLACEHOLDER_THRESHOLD) {
      setDocumentId(null);
      setDocumentName("No document uploaded");
    }

    setInitialized(true);
  }, [existingApp, initialized, permitTypeItems, locationItems, jobAssignerItems, workerItems, safetyEquipmentItems]);

  // File upload logic
  const pickAndUploadDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) {
      // On web, the actual File object is nested. On native, the asset itself is used.
      const asset = result.assets[0];
      const fileToUpload = Platform.OS === 'web' ? (asset as any).file : asset;
      fileToUpload.name = asset.name; // Ensure the name is consistent

      setUploading(true);
      try {
        const companyId = existingApp?.company_id ?? 1;
        const doc = await uploadDocument(fileToUpload, companyId);
        setDocumentId(doc.id);
        setDocumentName(doc.name);
        crossPlatformAlert("Upload Success", `Uploaded: ${doc.name}`);
      } catch (err: any) {
        crossPlatformAlert("Error", err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  // File download logic
  const handleDownloadDocument = async () => {
    if (!documentId) return;

    try {
      const blob = await downloadDocumentById(documentId);
      const fileName = documentName || "download";

      if (Platform.OS === "web") {
        // Create a link and trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // On native, you might use Share or FileSystem API
        const fileUri = FileSystem.cacheDirectory + fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

        // The blob needs to be read by a FileReader to get a base64 string
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(",")[1];
          try {
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            // Check if sharing is available
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri);
            } else {
              crossPlatformAlert("Sharing not available", "Sharing is not available on this device.");
            }
          } catch (e: any) {
            crossPlatformAlert("Error", `Failed to save or share file: ${e.message}`);
          }
        };
        reader.onerror = (error) => crossPlatformAlert("Error", "Failed to read file blob.");
        reader.readAsDataURL(blob);
      }
    } catch (err: any) {
      crossPlatformAlert("Error", err.message || "Download failed");
    }
  };

  // Submit or Save as Draft
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      const companyId = existingApp?.company_id ?? 1;
      let workflow: any = null;
      let workflowDataId: number | null = existingApp?.workflowDataId ?? null;

      // Create workflow + workflowData if not existing
      if (!workflowDataId) {
        workflow = await createWorkflow(
          `${permitName || "Untitled"} - ${userName} - Workflow`,
          companyId,
          permitType ?? PLACEHOLDER_ID
        );

        const workflowData = await createWorkflowData({
          company_id: companyId,
          workflow_id: workflow.id,
          name: `${permitName || "Untitled"} - ${userName} - Workflow Data`,
          start_time:
            status === "DRAFT"
              ? null
              : startTime
              ? startTime.toISOString()
              : new Date().toISOString(),
          end_time:
            status === "DRAFT"
              ? null
              : endTime
              ? endTime.toISOString()
              : new Date().toISOString(),
        });

        workflowDataId = workflowData.id;
      }

      // Validate required fields
      if (status === "SUBMITTED") {
        if (!permitName.trim() || !permitType || !location || !jobAssigner || !startTime || !endTime) {
          crossPlatformAlert("Error", "Please complete all required fields before submitting.");
          return;
        }
      } else if (status === "DRAFT") {
        if (!permitName.trim() || !permitType || !location || !startTime || !endTime || !documentId) {
          crossPlatformAlert(
            "Error",
            "Please complete all required fields before saving as draft (except Job Assigner)."
          );
          return;
        }
      }

      // Build payload for application
      const finalWorkerIds = await Promise.all(
        workerIds.map(async (idOrName) => {
          if (typeof idOrName === "number") {
            return idOrName;
          }
          if (typeof idOrName === "string") {
            try {
              const newWorker = await createWorker({ name: idOrName, company_id: companyId });
              return newWorker.id;
            } catch (err) {
              console.error(`Failed to create worker: ${idOrName}`, err);
              return null; // Or handle error appropriately
            }
          }
          return null;
        })
      );

      const finalSafetyEquipmentIds = await Promise.all(
        safetyEquipmentIds.map(async (idOrName) => {
          if (typeof idOrName === "number") {
            return idOrName;
          }
          if (typeof idOrName === "string") {
            try {
              const newEquipment = await createSafetyEquipment(idOrName, companyId);
              return newEquipment.id;
            } catch (err) {
              console.error(`Failed to create safety equipment: ${idOrName}`, err);
              return null; // Or handle error appropriately
            }
          }
          return null;
        })
      );
      const payload: any = {
        company_id: companyId,
        permit_type_id: permitType || PLACEHOLDER_ID,
        workflow_data_id: workflowDataId!,
        location_id: location || PLACEHOLDER_ID,
        applicant_id: userId || PLACEHOLDER_ID,
        name: permitName || "",
        document_id:
          documentId && documentId > 0
            ? documentId
            : existingApp?.documentId && existingApp.documentId > 0
            ? existingApp.documentId
            : PLACEHOLDER_ID,
        status,
        worker_ids: finalWorkerIds.filter(id => id !== null),
        safety_equipment_ids: finalSafetyEquipmentIds.filter(id => id !== null),
        created_by: applicantName || "Unknown User",
        updated_by: applicantName || "Unknown User",
      };

      // Save application
      const applicationId = await saveApplication(existingApp?.id || null, payload, !!existingApp);

      // Ensure workflow exists before creating approvals
      let workflowId = workflow?.id ?? existingApp?.workflow_id ?? existingApp?.workflowId ?? null;
      if (!workflowId) {
        const newWorkflow = await createWorkflow(
          `${permitName || "Untitled"} - ${applicantName} - Workflow`,
          companyId,
          permitType ?? PLACEHOLDER_ID
        );
        workflowId = newWorkflow.id;
      }

      // Create approvals if submitted
      if (status === "SUBMITTED" && jobAssigner) {
        const selectedAssigner = jobAssignerItems.find((item) => item.value === jobAssigner);

        // LEVEL 1 — SUPERVISOR (PENDING)
        const approval1 = await createApproval({
          company_id: companyId,
          workflow_id: workflowId,
          user_group_id: null,
          user_id: jobAssigner,
          name: `${permitName || "Untitled"} - ${selectedAssigner?.label || "Unknown"} - Supervisor`,
          role_name: "Supervisor",
          level: 1,
        });

        await createApprovalData({
          company_id: companyId,
          approval_id: approval1.id,
          document_id: payload.document_id ?? 0,
          workflow_data_id: workflowDataId!,
          status: PermitStatus.PENDING,
          approver_name: selectedAssigner?.label || "Supervisor",
          role_name: "Supervisor",
          level: 1,
        });

        // Notify Supervisor
        try {
          const title = `New Permit Application: ${permitName}`;
          const message = `
            <p>DO NOT REPLY TO THIS EMAIL.</p>
            <p>A new permit application <strong>${permitName}</strong> has been submitted by <strong>${applicantName}</strong>.</p>
            <p>It is currently waiting for your approval.</p>
            <p>Please log in to the application to review and take action.</p>
          `;
          await sendNotificationToUser(jobAssigner, { title, message });
        } catch (notifyErr) {
          console.warn("Failed to send notification to supervisor:", notifyErr);
        }

        // LEVEL 2 — SAFETY OFFICER (WAITING)
        try {
          const officerData = await fetchPermitOfficersByPermitType(permitType!);
          const selectedOfficer = officerData && officerData.length > 0 ? officerData[0] : null;

          if (selectedOfficer) {
            const approval2 = await createApproval({
              company_id: companyId,
              workflow_id: workflowId,
              user_group_id: null,
              user_id: selectedOfficer.user_id,
              name: `${permitName || "Untitled"} - ${selectedOfficer.user?.name || "Unknown"} - Safety Officer`,
              role_name: "HSE Department",
              level: 2,
            });

            await createApprovalData({
              company_id: companyId,
              approval_id: approval2.id,
              document_id: payload.document_id ?? 0,
              workflow_data_id: workflowDataId!,
              status: PermitStatus.WAITING,
              approver_name: selectedOfficer.user?.name || "Safety Officer",
              role_name: "HSE Department",
              level: 2,
            });
          }
        } catch (err) {
          console.error("Error fetching safety officer:", err);
        }

        // ---------------- KEEP THIS CODE COMMENTED OUT FOR NOW ----------------

        // // LEVEL 3 — SITE MANAGER (WAITING)
        // try {
        //   const managerData = await fetchLocationManagersByLocation(location!);
        //   const selectedManager = managerData && managerData.length > 0 ? managerData[0] : null;

        //   if (selectedManager) {
        //     const approval3 = await createApproval({
        //       company_id: companyId,
        //       workflow_id: workflowId,
        //       user_group_id: null,
        //       user_id: selectedManager.user_id,
        //       name: `${permitName || "Untitled"} - ${selectedManager.user?.name || "Unknown"} - Site Manager`,
        //       role_name: "Site Manager",
        //       level: 3,
        //     });

        //     await createApprovalData({
        //       company_id: companyId,
        //       approval_id: approval3.id,
        //       document_id: payload.document_id ?? 0,
        //       workflow_data_id: workflowDataId!,
        //       status: PermitStatus.WAITING,
        //       approver_name: selectedManager.user?.name || "Site Manager",
        //       role_name: "Site Manager",
        //       level: 3,
        //     });
        //   }
        // } catch (err) {
        //   console.error("Error fetching site manager:", err);
        // }
      }

      crossPlatformAlert(
        "Success",
        status === "DRAFT"
          ? "Application saved as draft."
          : "Application submitted successfully."
      );

      router.push("/(tabs)/mypermit");
    } catch (err: any) {
      console.error("Error in submitApplication full details:", JSON.stringify(err, null, 2));
      if (err.response) {
        console.error("Response error data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      crossPlatformAlert("Error", err.message || "Something went wrong");
    }
  };

  // Create safe setters to ensure state is always an array
  const safeSetWorkerIds = (value: React.SetStateAction<number[]>) => {
    setWorkerIds(value);
  };
  const safeSetSafetyEquipmentIds = (value: React.SetStateAction<number[]>) => {
    setSafetyEquipmentIds(value);
  };

  // Custom setter for start time to enforce same-day logic
  const handleSetStartTime = (date: Date | null) => {
    setStartTime(date);
    if (date) {
      // If endTime exists, update its date part to match startTime
      const newEndTime = endTime ? new Date(endTime) : new Date(date);
      newEndTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      // Only update if it's different to avoid re-renders
      if (newEndTime.getTime() !== endTime?.getTime()) {
        setEndTime(newEndTime);
      }
    }
  };

  return {
    applicantName,
    setApplicantName,
    permitName,
    setPermitName,
    documentId,
    documentName,
    uploading,
    pickAndUploadDocument,
    handleDownloadDocument,
    permitTypeOpen,
    permitType,
    permitTypeItems,
    setPermitTypeOpen,
    setPermitType,
    setPermitTypeItems,
    locationOpen,
    location,
    locationItems,
    setLocationOpen,
    setLocation,
    setLocationItems,
    jobAssignerOpen,
    jobAssigner,
    jobAssignerItems,
    setJobAssignerOpen,
    setJobAssigner,
    workersOpen,
    setWorkersOpen,
    workerIds,
    setWorkerIds: safeSetWorkerIds, // Use the safe setter
    workerItems,
    safetyEquipmentOpen,
    setSafetyEquipmentOpen,
    safetyEquipmentIds,
    setSafetyEquipmentIds: safeSetSafetyEquipmentIds, // Use the safe setter
    safetyEquipmentItems,
    setJobAssignerItems,
    startTime,
    setStartTime: handleSetStartTime, // Use the custom setter
    endTime,
    setEndTime,
    loading,
    submitApplication,
  };
}