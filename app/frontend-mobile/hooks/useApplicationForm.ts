import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  fetchPermitTypes,
  fetchLocations,
  uploadDocument,
  createWorkflow,
  createWorkflowData,
  saveApplication,
  fetchUsersByGroupName,
  createApproval,
  createApprovalData,
  fetchPermitOfficersByPermitType,
  fetchLocationManagersByLocation,
} from "@/services/api";
import Constants from "expo-constants";
import { useUser } from "@/contexts/UserContext";
import { PermitStatus } from "@/constants/Status";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const APPROVER_GROUP_NAME = Constants.expoConfig?.extra?.APPROVER_GROUP_NAME;
const PLACEHOLDER_THRESHOLD = 3;
const PLACEHOLDER_ID = 1;

export function useApplicationForm(existingApp: any, router: any) {
  const { userId, userName } = useUser();

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

  const [startTime, setStartTime] = useState<Date | null>(
    existingApp?.workStartTime ? new Date(existingApp.workStartTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    existingApp?.workEndTime ? new Date(existingApp.workEndTime) : null
  );

  const [initialized, setInitialized] = useState(false);

  // Fetch dropdown data once
  useEffect(() => {
    async function fetchData() {
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

        if (userId) {
          const currentUser = approversData.find((u: any) => u.id === userId);
          setApplicantName(currentUser?.name || "Unknown User");
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    }
    fetchData();
  }, [userId]);

  // Initialize values from existing application after dropdowns load
  useEffect(() => {
    if (!existingApp || initialized) return;
    if (
      permitTypeItems.length === 0 ||
      locationItems.length === 0 ||
      jobAssignerItems.length === 0
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

    // Reset document placeholders
    if (!existingApp.documentId || existingApp.documentId <= PLACEHOLDER_THRESHOLD) {
      setDocumentId(null);
      setDocumentName("No document uploaded");
    }

    setInitialized(true);
  }, [existingApp, initialized, permitTypeItems, locationItems, jobAssignerItems]);

  // File upload logic
  const pickAndUploadDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) {
      const file = result.assets[0];
      setUploading(true);
      try {
        const companyId = existingApp?.company_id ?? 1;
        const doc = await uploadDocument(file, companyId);
        setDocumentId(doc.id);
        setDocumentName(doc.name);
        Alert.alert("Upload Success", `Uploaded: ${doc.name}`);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  // Submit or Save as Draft
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      const companyId = existingApp?.company_id ?? 1;
      const applicantId = userId || PLACEHOLDER_ID;
      const applicantFullName = userName || "Unknown User";

      // Validate required fields
      if (
        status === "SUBMITTED" &&
        (!permitName.trim() || !permitType || !location || !jobAssigner || !startTime || !endTime)
      ) {
        Alert.alert("Error", "Please complete all required fields before submitting.");
        return;
      }

      if (
        status === "DRAFT" &&
        (!permitName.trim() || !permitType || !location || !startTime || !endTime || !documentId)
      ) {
        Alert.alert(
          "Error",
          "Please complete all required fields before saving as draft (except Job Assigner)."
        );
        return;
      }

      // -----------------------------
      // Create Workflow & Workflow Data
      // -----------------------------
      let workflow: any = null;
      let workflowDataId: number | null = existingApp?.workflowDataId ?? null;

      if (!workflowDataId) {
        workflow = await createWorkflow(
          `${permitName || "Untitled"} - ${applicantFullName} - Workflow`,
          companyId,
          permitType ?? PLACEHOLDER_ID
        );

        const workflowData = await createWorkflowData({
          company_id: companyId,
          workflow_id: workflow.id,
          name: `${permitName || "Untitled"} - ${applicantFullName} - Workflow Data`,
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

      // -----------------------------
      // Save Application
      // -----------------------------
      const payload: any = {
        company_id: companyId,
        permit_type_id: permitType ?? PLACEHOLDER_ID,
        workflow_data_id: workflowDataId!,
        location_id: location ?? PLACEHOLDER_ID,
        job_assigner_id: jobAssigner ?? PLACEHOLDER_ID,
        applicant_id: applicantId,
        name: permitName || "",
        document_id: documentId ?? PLACEHOLDER_ID,
        status,
        created_by: applicantFullName, // ensure created_by is set
      };

      const applicationId = await saveApplication(
        existingApp?.id || null,
        payload,
        !!existingApp
      );

      // -----------------------------
      // Ensure workflow exists for approvals
      // -----------------------------
      const workflowId =
        workflow?.id ?? existingApp?.workflow_id ?? existingApp?.workflowId ?? null;

      if (!workflowId) throw new Error("Workflow ID not found");

      // -----------------------------
      // Create Approvals (if SUBMITTED)
      // -----------------------------
      if (status === "SUBMITTED" && jobAssigner) {
        const selectedAssigner = jobAssignerItems.find((item) => item.value === jobAssigner);

        // Helper function to create approval + approval data
        const createApprovalWithData = async (
          level: number,
          roleName: string,
          userId: number,
          approverName: string
        ) => {
          const approval = await createApproval({
            company_id: companyId,
            workflow_id: workflowId,
            user_group_id: null,
            user_id: userId,
            name: `${permitName || "Untitled"} - ${applicantFullName} - ${roleName}`,
            role_name: roleName,
            level,
          });

          await createApprovalData({
            company_id: companyId,
            approval_id: approval.id,
            document_id: payload.document_id ?? 0,
            workflow_data_id: workflowDataId!,
            status: PermitStatus.PENDING,
            approver_name: approverName,
            role_name: roleName,
            level,
          });
        };

        // LEVEL 1 — Supervisor (Job Assigner)
        await createApprovalWithData(
          1,
          "Supervisor",
          jobAssigner,
          selectedAssigner?.label || "Supervisor"
        );

        // LEVEL 2 — Safety Officer (based on permit type)
        try {
          const officerData = await fetchPermitOfficersByPermitType(permitType!);
          const selectedOfficer = officerData?.[0];
          if (selectedOfficer) {
            await createApprovalWithData(
              2,
              "Safety Officer",
              selectedOfficer.user_id,
              selectedOfficer.user?.name || "Safety Officer"
            );
          }
        } catch (err) {
          console.error("Error fetching safety officer:", err);
        }

        // LEVEL 3 — Site Manager (based on location)
        try {
          const managerData = await fetchLocationManagersByLocation(location!);
          const selectedManager = managerData?.[0];
          if (selectedManager) {
            await createApprovalWithData(
              3,
              "Site Manager",
              selectedManager.user_id,
              selectedManager.user?.name || "Site Manager"
            );
          }
        } catch (err) {
          console.error("Error fetching site manager:", err);
        }
      }

      Alert.alert(
        "Success",
        status === "DRAFT"
          ? "Application saved as draft."
          : "Application submitted successfully."
      );

      router.push("/(tabs)/mypermit");
    } catch (err: any) {
      console.error("Error in submitApplication:", err);
      Alert.alert("Error", err.message || "Something went wrong");
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
    setJobAssignerItems,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    submitApplication,
  };
}