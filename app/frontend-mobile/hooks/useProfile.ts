import { useEffect, useState } from "react";
import { 
  getCurrentUser,
  fetchCompanyById,
  fetchLocationForSiteManager,
  fetchPermitTypeForSafetyOfficer 
} from "@/services/api";

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      const currentUserData = await getCurrentUser();
      const companyById = await fetchCompanyById(currentUserData.company_id);
      const locationForSiteManager = await fetchLocationForSiteManager(currentUserData.id);
      const permitTypeForSafetyOfficer = await fetchPermitTypeForSafetyOfficer(currentUserData.id);
      console.log("Current User Data:", currentUserData);
      console.log("Company Data:", companyById);
      console.log("Location Data for Site Manager:", locationForSiteManager);
      console.log("Permit Type Data for Safety Officer:", permitTypeForSafetyOfficer);
      setProfile(currentUserData);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
}