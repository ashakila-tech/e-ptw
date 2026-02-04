import { useState, useEffect } from "react";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import { useUser } from "@/contexts/UserContext";
import {
  createReport,
  fetchDepartments,
  fetchLocations,
  uploadDocument,
  fetchUsersByGroupName,
  sendNotificationToUser,
  fetchDepartmentHeads,
} from "../../shared/services/api";
import { downloadDocument } from "@/utils/download";
import { CONDITION_ITEMS } from "../../shared/constants/Conditions";
import { CONCERN_ITEMS } from "../../shared/constants/Concerns";
import { USER_GROUPS } from "../../shared/constants/UserGroups";
import * as DocumentPicker from "expo-document-picker";

// Define interfaces for fetched data
interface Location {
  id: number;
  name: string;
}
interface Department {
  id: number;
  name: string;
}

export function useReportForm(router: any) {
  const { userId } = useUser();

  // Form state
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState<number | undefined>();
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [incidentTimestamp, setIncidentTimestamp] = useState(new Date());
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<string | null>(null);
  const [concern, setConcern] = useState<string | null>(null);
  const [immediateAction, setImmediateAction] = useState("");
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [concernOpen, setConcernOpen] = useState(false);

  // Data for pickers
  const [locationItems, setLocationItems] = useState<{label: string, value: number}[]>([]);
  const [departmentItems, setDepartmentItems] = useState<{label: string, value: number}[]>([]);
  const [conditionItems, setConditionItems] = useState(CONDITION_ITEMS);
  const [concernItems, setConcernItems] = useState(CONCERN_ITEMS);

  // Fetch data for pickers on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locs, deps] = await Promise.all([
          fetchLocations(),
          fetchDepartments(),
        ]);
        const fetchedLocations = locs.results || locs;
        setLocationItems(fetchedLocations.map((loc: Location) => ({ label: loc.name, value: loc.id })));
        const fetchedDepartments = deps.results || deps;
        setDepartmentItems(fetchedDepartments.map((dep: Department) => ({ label: dep.name, value: dep.id })));
      } catch (error) {
        console.error("Failed to fetch locations or departments", error);
        crossPlatformAlert("Error", "Could not load required data for the form.");
      }
    };
    fetchData();
  }, []);

  const submitReport = async () => {
    if (!name.trim() || !locationId || !description.trim()) {
      crossPlatformAlert("Incomplete Form", "Please fill out all required fields: Title, Location, and Description.");
      return;
    }

    if (!userId) {
      crossPlatformAlert("Error", "Could not identify user. Please log in again.");
      return;
    }

    setLoading(true);
    
    const payload = {
      name,
      user_id: userId,
      incident_timestamp: incidentTimestamp.toISOString(),
      location_id: locationId,
      description,
      department_id: departmentId || null,
      condition: condition,
      concern: concern,
      immediate_action: immediateAction.trim() || null,
      document_id: documentId || null,
    };

    try {
      await createReport(payload);

      // Notify Safety Officers
      try {
        const safetyOfficers = await fetchUsersByGroupName(USER_GROUPS.SafetyOfficer);
        const locationName = locationItems.find((l) => l.value === locationId)?.label || "Unknown Location";
        const title = `New Near Miss Report: ${name}`;
        const message = `
          <p>DO NOT REPLY TO THIS EMAIL.</p>
          <p>A new near miss report <strong>${name}</strong> has been submitted.</p>
          <p><strong>Location:</strong> ${locationName}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p>Please log in to the application to review and take action.</p>
        `;

        await Promise.all(
          safetyOfficers.map((officer: any) =>
            sendNotificationToUser(officer.id, { title, message })
          )
        );
      } catch (notifyErr) {
        console.warn("Failed to notify Safety Officers:", notifyErr);
      }

      // Notify Department Heads
      if (departmentId) {
        try {
          const departmentHeads = await fetchDepartmentHeads(departmentId);
          const locationName = locationItems.find((l) => l.value === locationId)?.label || "Unknown Location";
          const title = `New Near Miss Report: ${name}`;
          const message = `
            <p>DO NOT REPLY TO THIS EMAIL.</p>
            <p>A new near miss report <strong>${name}</strong> has been submitted affecting your department.</p>
            <p><strong>Location:</strong> ${locationName}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>Please log in to the application to review.</p>
          `;

          await Promise.all(
            departmentHeads.map((head: any) =>
              sendNotificationToUser(head.user_id, { title, message })
            )
          );
        } catch (notifyErr) {
          console.warn("Failed to notify Department Heads:", notifyErr);
        }
      }

      setLoading(false);
      crossPlatformAlert("Success", "Your near miss report has been submitted.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      setLoading(false);
      crossPlatformAlert("Submission Failed", error.message || "An unknown error occurred.");
    }
  };

  const pickAndUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      setUploading(true);

      const response = await uploadDocument(asset);
      setDocumentId(response.id);
      setDocumentName(response.name);
    } catch (error) {
      console.error("Upload failed", error);
      crossPlatformAlert("Error", "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = () => {
    if (documentId && documentName) downloadDocument(documentId, documentName);
  };

  return {
    name, setName,
    locationId, setLocationId,
    departmentId, setDepartmentId,
    incidentTimestamp, setIncidentTimestamp,
    description, setDescription,
    condition, setCondition,
    concern, setConcern,
    immediateAction, setImmediateAction,
    documentId,
    documentName,
    uploading,
    loading,
    locationOpen, setLocationOpen,
    departmentOpen, setDepartmentOpen,
    conditionOpen, setConditionOpen,
    concernOpen, setConcernOpen,
    locationItems, setLocationItems,
    departmentItems, setDepartmentItems,
    conditionItems, setConditionItems,
    concernItems, setConcernItems,
    submitReport,
    pickAndUploadDocument,
    handleDownloadDocument,
  };
}