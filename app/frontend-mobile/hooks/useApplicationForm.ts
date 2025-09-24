import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Constants from "expo-constants";
import {
  fetchPermitTypes,
  fetchLocations,
  fetchUsers,
  fetchUserGroups,
  uploadDocument,
  createWorkflow,
  createWorkflowData,
  updateWorkflowData,
  saveApplication,
  createApproval,
} from "@/services/api";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export function useApplicationForm(existingApp: any, router: any) {
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
  const [jobAssigner, setJobAssigner] = useState<number | null>(existingApp?.approverId || null);
  const [jobAssignerItems, setJobAssignerItems] = useState<{ label: string; value: number }[]>([]);

  const [startTime, setStartTime] = useState<Date | null>(
    existingApp?.workStartTime ? new Date(existingApp.workStartTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    existingApp?.workEndTime ? new Date(existingApp.workEndTime) : null
  );

  // Fetch dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const [typeData, locData, users, userGroups] = await Promise.all([
          fetchPermitTypes(),
          fetchLocations(),
          fetchUsers(),
          fetchUserGroups(),
        ]);

        setPermitTypeItems(typeData.map((t: any) => ({ label: t.name, value: t.id })));
        setLocationItems(locData.map((l: any) => ({ label: l.name, value: l.id })));

        // Map users to job assigners (simple version: all users)
        setJobAssignerItems(users.map((u: any) => ({ label: u.name, value: u.id })));
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    }
    fetchData();
  }, []);

  // Pick + upload document
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

  // Submit / draft
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      if (!jobAssigner && status === "SUBMITTED") {
        return Alert.alert("Error", "Please select a job assigner before submitting.");
      }

      let workflowDataId: number | null = existingApp?.workflowDataId ?? null;

      if (workflowDataId) {
        const wfRes = await fetch(`${API_BASE_URL}api/workflow-data/${workflowDataId}`);
        if (wfRes.ok) {
          const existingWorkflowData = await wfRes.json();
          const existingWorkflowId = existingWorkflowData.workflow_id;
          await updateWorkflowData(workflowDataId, {
            name: `${permitName} - ${applicantName} - Workflow Data`,
            start_time: startTime?.toISOString(),
            end_time: endTime?.toISOString(),
            workflow_id: existingWorkflowId,
          });
        }
      }

      if (!workflowDataId) {
        const workflow = await createWorkflow(
          `${permitName} - ${applicantName} - Workflow`,
          1, // company_id
          permitType ?? 0
        );
        const workflowData = await createWorkflowData({
          company_id: 1,
          workflow_id: workflow.id,
          name: `${permitName} - ${applicantName} - Workflow Data`,
          start_time: startTime?.toISOString() || new Date().toISOString(),
          end_time: endTime?.toISOString() || new Date().toISOString(),
        });
        workflowDataId = workflowData.id;
      }

      const payload = {
        permit_type_id: permitType ?? 0,
        workflow_data_id: workflowDataId,
        location_id: location ?? 0,
        applicant_id: 1, // replace with logged-in user
        name: permitName || "Unnamed Permit",
        document_id: documentId ?? 0,
        status,
      };

      await saveApplication(existingApp?.id || null, payload, !!existingApp);

      // Create approval if submitting
      if (status === "SUBMITTED" && jobAssigner) {
        await createApproval({
          workflow_data_id: workflowDataId,
          status: "PENDING",
          approver_id: jobAssigner,
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
      console.error("Error submitting application:", err);
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
    submitApplication,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  };
}