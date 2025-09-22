import { useState, useEffect } from "react";
import { API_BASE_URL } from "@env";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  fetchPermitTypes,
  fetchLocations,
  uploadDocument,
  createWorkflow,
  createWorkflowData,
  updateWorkflowData,
  saveApplication,
} from "@/services/api";

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

  const [startTime, setStartTime] = useState<Date | null>(
    existingApp?.workStartTime ? new Date(existingApp.workStartTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    existingApp?.workEndTime ? new Date(existingApp.workEndTime) : null
  );

  // fetch dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const typeData = await fetchPermitTypes();
        setPermitTypeItems(typeData.map((t: any) => ({ label: t.name, value: t.id })));

        const locData = await fetchLocations();
        setLocationItems(locData.map((l: any) => ({ label: l.name, value: l.id })));
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    }
    fetchData();
  }, []);

  // pick + upload document
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

  // submit / draft
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      // workflowDataId — either reuse existing, or will be assigned when created
      let workflowDataId: number | null = existingApp?.workflowDataId ?? null;

      if (workflowDataId) {
        // --- Editing: update the existing workflow-data ---
        // fetch the existing workflow-data to obtain workflow_id & company_id
        const wfRes = await fetch(`${API_BASE_URL}api/workflow-data/${workflowDataId}`);
        if (!wfRes.ok) {
          // if backend returns 404 or similar, fall through to create new below
          console.warn(`Failed to fetch existing workflow-data (${wfRes.status}), will try to recreate`);
        } else {
          const existingWorkflowData = await wfRes.json();
          // obtain workflow_id and company_id from the existing workflow-data
          const existingWorkflowId = existingWorkflowData.workflow_id ?? existingWorkflowData.workflow?.id;
          const existingCompanyId = existingWorkflowData.company_id ?? existingWorkflowData.company?.id ?? existingApp?.company_id ?? 1;

          // update workflow-data with new start/end/name
          await updateWorkflowData(workflowDataId, {
            name: `${permitName} - ${applicantName} - Workflow Data`,
            start_time: startTime ? startTime.toISOString() : null,
            end_time: endTime ? endTime.toISOString() : null,
            workflow_id: existingWorkflowId ?? undefined,
            company_id: existingCompanyId ?? undefined,
          });
        }
      } 

      // If after attempted update we still do not have a workflowDataId (e.g. no existing or fetch failed),
      // create a new workflow + workflow-data
      if (!workflowDataId) {
        // create workflow (requires name, company_id, permit_type_id)
        const companyId = existingApp?.company_id ?? 1; // replace with real company ID from auth/session
        const permitTypeIdForWorkflow = permitType ?? existingApp?.permitTypeId ?? 0;

        const workflow = await createWorkflow(
          `${permitName} - ${applicantName} - Workflow`,
          companyId,
          permitTypeIdForWorkflow
        );

        // create workflow-data attached to the workflow
        const workflowData = await createWorkflowData({
          company_id: companyId,
          workflow_id: workflow.id,
          name: `${permitName} - ${applicantName} - Workflow Data`,
          start_time: startTime ? startTime.toISOString() : new Date().toISOString(),
          end_time: endTime ? endTime.toISOString() : new Date().toISOString(),
        });

        workflowDataId = workflowData.id;
      }

      // --- Now save the application (match backend schema) ---
      const payload = {
        permit_type_id: permitType ?? existingApp?.permitTypeId ?? 0,
        workflow_data_id: workflowDataId!,
        location_id: location ?? existingApp?.locationId ?? 0,
        applicant_id: 1, // TODO: replace with actual logged-in user id
        name: permitName || "Unnamed Permit",
        document_id: documentId ?? existingApp?.documentId ?? 0,
        status,
      };

      console.log("Submitting application payload:", payload);

      await saveApplication(existingApp?.id || null, payload, !!existingApp);

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
    submitApplication,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  };
}