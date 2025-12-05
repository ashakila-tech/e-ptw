import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as api from "@/services/api";
import { useProfile } from "./useProfile";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";

export function useWorkerForm() {
  const router = useRouter();
  const { profile, refresh: refreshProfile } = useProfile();
  const params = useLocalSearchParams();
  const existingWorker = params.worker ? JSON.parse(params.worker as string) : null;
  const isEditMode = !!existingWorker;

  const [name, setName] = useState("");
  const [icPassport, setIcPassport] = useState(""); // Corrected variable name
  const [contact, setContact] = useState("");
  const [position, setPosition] = useState("");

  const [employmentStatus, setEmploymentStatus] = useState<string | null>(null);
  const [employmentStatusOpen, setEmploymentStatusOpen] = useState(false);
  const [employmentStatusItems, setEmploymentStatusItems] = useState([
    { label: "Permanent", value: "Permanent" },
    { label: "Part-time", value: "Part-time" },
    { label: "Contract", value: "Contract" },
  ]);

  const [employmentType, setEmploymentType] = useState<string | null>(null);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [employmentTypeItems, setEmploymentTypeItems] = useState([
    { label: "Local Worker", value: "Local Worker" },
    { label: "Foreign Worker", value: "Foreign Worker" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingWorker) {
      setName(existingWorker.name || "");
      setIcPassport(existingWorker.ic_passport || "");
      setContact(existingWorker.contact || "");
      setPosition(existingWorker.position || "");
      setEmploymentStatus(existingWorker.employment_status || null);
      setEmploymentType(existingWorker.employment_type || null);
    }
  }, []); // Run only once on initial mount


  const handleSubmit = async () => {
    if (!name.trim() || !icPassport.trim()) {
      setError("Name and IC/Passport are required.");
      return;
    }
    if (!profile?.company_id) {
      setError("Could not determine company. Please try again.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payload = {
        company_id: existingWorker?.company_id || profile.company_id,
        name,
        ic_passport: icPassport,
        contact,
        position,
        employment_status: employmentStatus,
        employment_type: employmentType,
      };
      if (isEditMode) {
        await api.updateWorker(existingWorker.id, payload);
      } else {
        await api.createWorker(payload);
      }
      await refreshProfile();
      crossPlatformAlert("Success", `Worker "${name}" has been ${isEditMode ? 'updated' : 'added'}.`);
      router.replace("/(tabs)/profile");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    name, setName,
    icPassport, setIcPassport,
    contact, setContact,
    position, setPosition,
    employmentStatus, setEmploymentStatus,
    employmentStatusOpen, setEmploymentStatusOpen,
    employmentStatusItems, setEmploymentStatusItems,
    employmentType, setEmploymentType,
    employmentTypeOpen, setEmploymentTypeOpen,
    employmentTypeItems, setEmploymentTypeItems,
    error,
    loading,
    isEditMode,
    handleSubmit,
  };
}