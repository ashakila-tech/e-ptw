import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as api from "@/services/api";
import { useProfile } from "./useProfile";

export function useWorkerForm() {
  const router = useRouter();
  const { profile, refresh: refreshProfile } = useProfile();

  const [name, setName] = useState("");
  const [icPassport, setIcPassport] = useState("");
  const [contact, setContact] = useState("");
  const [position, setPosition] = useState("");

  const [employmentStatus, setEmploymentStatus] = useState<string | null>(null);
  const [employmentStatusOpen, setEmploymentStatusOpen] = useState(false);
  const [employmentStatusItems, setEmploymentStatusItems] = useState([
    { label: "Permanent", value: "permanent" },
    { label: "Part-time", value: "part-time" },
    { label: "Contract", value: "contract" },
  ]);

  const [employmentType, setEmploymentType] = useState<string | null>(null);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [employmentTypeItems, setEmploymentTypeItems] = useState([
    { label: "Local Worker", value: "local-worker" },
    { label: "Foreign Worker", value: "foreign-worker" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        company_id: profile.company_id,
        name,
        ic_passport: icPassport,
        contact,
        position,
        employment_status: employmentStatus,
        employment_type: employmentType,
      };
      await api.createWorker(payload);
      await refreshProfile(); // Refresh the profile to get the new worker list
      Alert.alert("Success", `Worker "${name}" has been added.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
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
    handleSubmit,
  };
}