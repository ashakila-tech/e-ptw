import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  fetchPermitTypes,
  fetchLocations,
  uploadDocument,
  createWorkflow,
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

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

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

  const submitApplication = async (status: "DRAFT" | "SUBMITTED") => {
    try {
      const workflow = await createWorkflow(
        `${permitName} - ${applicantName} - Workflow`
      );

      const payload = {
        name: permitName || "Unnamed Permit",
        permit_type_id: permitType ?? 1,
        location_id: location ?? 1,
        document_id: documentId ?? 1,
        status,
        applicant_id: 1,
        workflow_data_id: workflow.id,
        start_time: startTime ? startTime.toISOString() : null,
        end_time: endTime ? endTime.toISOString() : null,
      };

      await saveApplication(existingApp?.id || null, payload, !!existingApp);

      Alert.alert(
        "Success",
        status === "DRAFT"
          ? "Application saved as draft."
          : "Application submitted successfully."
      );
      router.push("/(tabs)/mypermit");
    } catch (err: any) {
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
