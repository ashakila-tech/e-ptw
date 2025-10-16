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
  fetchUsers,
  createApproval,
  createApprovalData,
} from "@/services/api";
import Constants from "expo-constants";
import { useUser } from "@/contexts/UserContext";
import { PermitStatus } from "@/constants/Status";

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
  const [jobAssigner, setJobAssigner] = useState<number | null>(existingApp?.jobAssignerId || null);
  const [jobAssignerItems, setJobAssignerItems] = useState<{ label: string; value: number }[]>([]);

  const [startTime, setStartTime] = useState<Date | null>(
    existingApp?.workStartTime ? new Date(existingApp.workStartTime) : null
  );
  const [endTime, setEndTime] = useState<Date | null>(
    existingApp?.workEndTime ? new Date(existingApp.workEndTime) : null
  );

  // Fetch dropdowns and applicant name
  useEffect(() => {
    async function fetchData() {
      try {
        const typeData = await fetchPermitTypes();
        setPermitTypeItems(typeData.map((t: any) => ({ label: t.name, value: t.id })));

        const locData = await fetchLocations();
        setLocationItems(locData.map((l: any) => ({ label: l.name, value: l.id })));

        const usersData = await fetchUsers();
        setJobAssignerItems(usersData.map((u: any) => ({ label: u.name, value: u.id })));

        if (userId) {
          const currentUser = usersData.find((u: any) => u.id === userId);
          setApplicantName(currentUser?.name || "Unknown User");
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    }
    fetchData();
  }, [userId]);

  // Pick and upload document
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

  // Submit or save as draft
  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      console.log("STEP 1: Starting submitApplication");

      let workflow: any = null;
      let workflowDataId: number | null = existingApp?.workflowDataId ?? null;

      // Create workflow and workflow data if not already existing
      if (!workflowDataId) {
        const companyId = existingApp?.company_id ?? 1;
        const permitTypeIdForWorkflow =
          permitType ??
          existingApp?.permitTypeId ??
          (permitTypeItems.length > 0 ? permitTypeItems[0].value : 1);

        console.log("STEP 2: Starting createWorkflow and createWorkflowData");

        workflow = await createWorkflow(
          `${permitName || "Untitled"} - ${applicantName} - Workflow`,
          companyId,
          permitTypeIdForWorkflow
        );

        const workflowData = await createWorkflowData({
          company_id: companyId,
          workflow_id: workflow.id,
          name: `${permitName || "Untitled"} - ${applicantName} - Workflow Data`,
          start_time: startTime ? startTime.toISOString() : new Date().toISOString(),
          end_time: endTime ? endTime.toISOString() : new Date().toISOString(),
        });

        workflowDataId = workflowData.id;
      }

      const fallbackPermitTypeId = permitTypeItems.length > 0 ? permitTypeItems[0].value : 1;
      const fallbackLocationId = locationItems.length > 0 ? locationItems[0].value : 1;

      const companyId = existingApp?.company_id ?? 1; // Default to 1 if not provided

      const payload: any = {
        company_id: companyId,
        permit_type_id: permitType ?? existingApp?.permitTypeId ?? fallbackPermitTypeId,
        workflow_data_id: workflowDataId!,
        location_id: location ?? existingApp?.locationId ?? fallbackLocationId,
        applicant_id: userId ?? 0,
        name: permitName || "Unnamed Permit",
        document_id: documentId ?? existingApp?.documentId ?? null,
        status,
      };

      if (documentId ?? existingApp?.documentId) {
        payload.document_id = documentId ?? existingApp?.documentId;
      }

      if (jobAssigner) {
        payload.job_assigner_id = jobAssigner;
      }

      console.log("STEP 2.5: Application payload:", payload);

      const applicationId = await saveApplication(existingApp?.id || null, payload, !!existingApp);

      console.log("STEP 2.6: Application save result:", applicationId);

      console.log("STEP 3: Starting createApproval if SUBMITTED");

      // Create approval and approval data when submitting
      if (status === "SUBMITTED" && jobAssigner) {
        const selectedAssigner = jobAssignerItems.find(item => item.value === jobAssigner);

        console.log("Creating approval with payload:", {
          company_id: existingApp?.company_id ?? 1,
          workflow_id: workflowDataId!,
          user_group_id: null,
          user_id: jobAssigner,
          name: "Job Assigner",
          role_name: "Job Assigner",
          level: 1,
        });


        const approval = await createApproval({
          company_id: existingApp?.company_id ?? 1,
          workflow_id: workflow?.id ?? existingApp?.workflow_id ?? 0, // Fixed: use workflow ID
          user_group_id: null,
          user_id: jobAssigner,
          name: "Job Assigner",
          role_name: "Job Assigner",
          level: 1,
        });

        console.log("Approval payload being sent:", approval);

        await createApprovalData({
          company_id: existingApp?.company_id ?? 1,
          approval_id: approval.id,
          document_id: payload.document_id ?? 0,
          workflow_data_id: workflowDataId!, // Fixed: correct mapping
          status: PermitStatus.PENDING,
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
        console.error("Error in submitApplication full details:", JSON.stringify(err, null, 2));
        if (err.response) {
          console.error("Response error data:", err.response.data);
          console.error("Response status:", err.response.status);
        }
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