import { useEffect, useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { 
  getCurrentUser,
  fetchCompanyById,
  fetchLocationForSiteManager,
  fetchPermitTypeForSafetyOfficer,
  fetchWorkers
} from "@/services/api";

const SAFETY_OFFICER = "Safety Officer";
const SITE_MANAGER = "Site Manager";

export function useProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const currentUserData = await getCurrentUser();
      const companyById = await fetchCompanyById(currentUserData.company_id);
      currentUserData.company_name = companyById;
      
      if (currentUserData.groups[0].name === SITE_MANAGER) {
        const locationForSiteManager = await fetchLocationForSiteManager(currentUserData.id);
        currentUserData.locations = locationForSiteManager;
      }

      if (currentUserData.groups[0].name === SAFETY_OFFICER) {
        const permitTypeForSafetyOfficer = await fetchPermitTypeForSafetyOfficer(currentUserData.id);
        currentUserData.permit_types = permitTypeForSafetyOfficer;
        console.log("Fetched permit types:", permitTypeForSafetyOfficer);
      }

      const workersData = await fetchWorkers(currentUserData.company_id);
      setWorkers(workersData);


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
    workers,
  };
}