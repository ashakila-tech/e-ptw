import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  fetchPermitTypes,
  fetchLocations,
  fetchUsers,
  uploadDocument,
  createWorkflow,
  createWorkflowData,
  saveApplication,
  createApproval,
} from "@/services/api";
import Constants from "expo-constants";
import { useUser } from "@/contexts/UserContext";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export function useApplicationForm(existingApp: any, router: any) {
  const { userId } = useUser();

  const [applicantName, setApplicantName] = useState(existingApp?.createdBy || "");
  const [permitName, setPermitName] = useState(existingApp?.name || "");

  const [documentId, setDocumentId] = useState<number | null>(existingApp?.documentId || null);
  const [documentName, setDocumentName] = useState<string | null>(existingApp?.document || null);
  const [uploading, setUploading] = useState(false);

  const [permitTypeOpen, setPermitTypeOpen] = useState(false);
  const [permitType, setPermitType] = useState<number | null>(existingApp?.permitTypeId || null);
  const [permitTypeItems, setPermitTypeItems] = useState<{ label: string; value: number }[]>([]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<number | null>(existingApp?.locationId || null);
  const [locationItems, setLocationItems] = useState<{ label: string; value: number }[]>([]);

  const [jobAssignerOpen, setJobAssignerOpen] = useState(false);
  const [jobAssigner, setJobAssigner] = useState<number | null>(null);
  const [jobAssignerItems, setJobAssignerItems] = useState<{ label: string; value: number }[]>([]);

  const [startTime, setStartTime] = useState<Date | null>(
    existingApp?.workStartTime ? new Date(existingApp.workStartTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    existingApp?.workEndTime ? new Date(existingApp.workEndTime) : null
  );

  // Fetch dropdown data
  useEffect(() => {
    async function fetchData() {
      try {
        const typeData = await fetchPermitTypes();
        setPermitTypeItems(typeData.map((t: any) => ({ label: t.name, value: t.id })));

        const locData = await fetchLocations();
        setLocationItems(locData.map((l: any) => ({ label: l.name, value: l.id })));

        const usersData = await fetchUsers();
        setJobAssignerItems(usersData.map((u: any) => ({ label: u.name, value: u.id })));

        // Pre-fill job assigner after items are loaded
        if (existingApp?.jobAssignerId != null) {
          setJobAssigner(existingApp.jobAssignerId);
        }

        // Set applicant name to current user if available
        if (userId) {
          const currentUser = usersData.find((u: any) => u.id === userId);
          setApplicantName(currentUser?.name || existingApp?.createdBy || "Unknown User");
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    }

    fetchData();
  }, [existingApp, userId]);

  // Pick and upload document
  const pickAndUploadDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) {
      const file = result.assets[0];
      setUploading(true);
      try {
        const doc = await uploadDocument(file);
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

  // Submit or save draft
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      let workflowDataId: number | null = existingApp?.workflowDataId ?? null;

      if (!workflowDataId) {
        const companyId = existingApp?.company_id ?? 1;
        const permitTypeIdForWorkflow = permitType ?? existingApp?.permitTypeId ?? 0;

        const workflow = await createWorkflow(
          `${permitName} - ${applicantName} - Workflow`,
          companyId,
          permitTypeIdForWorkflow
        );

        const workflowData = await createWorkflowData({
          company_id: companyId,
          workflow_id: workflow.id,
          name: `${permitName} - ${applicantName} - Workflow Data`,
          start_time: startTime ? startTime.toISOString() : new Date().toISOString(),
          end_time: endTime ? endTime.toISOString() : new Date().toISOString(),
        });

        workflowDataId = workflowData.id;
      }

      const payload = {
        permit_type_id: permitType ?? existingApp?.permitTypeId ?? 0,
        workflow_data_id: workflowDataId!,
        location_id: location ?? existingApp?.locationId ?? 0,
        applicant_id: userId ?? 0,
        name: permitName || "Unnamed Permit",
        document_id: documentId ?? existingApp?.documentId ?? null,
        status,
        job_assigner_id: jobAssigner ?? undefined,
      };

      const applicationId = await saveApplication(existingApp?.id || null, payload, !!existingApp);

      // Create approval automatically if submitting
      if (status === "SUBMITTED" && jobAssigner) {
        const selectedAssigner = jobAssignerItems.find(item => item.value === jobAssigner);
        await createApproval({
          company_id: existingApp?.company_id ?? 1,
          approval_id: jobAssigner,
          workflow_data_id: workflowDataId!,
          document_id: documentId ?? 0,
          status: "PENDING",
          approver_name: selectedAssigner?.label || "Approver",
          role_name: "Job Assigner",
          level: 1,
          time: new Date().toISOString(),
        });
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