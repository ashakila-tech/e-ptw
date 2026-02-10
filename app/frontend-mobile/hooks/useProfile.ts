import { useEffect, useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { 
  getCurrentUser,
  fetchCompanyById,
  fetchLocationForSiteManager,
  fetchPermitTypeForSafetyOfficer,
  fetchWorkers,
  deleteWorker,
  fetchReports,
  fetchApplicationsForApprover
} from "../../shared/services/api";

const SAFETY_OFFICER = "Safety Officer";
const SITE_MANAGER = "Site Manager";

export function useProfile() {
  const { isApproval, userId } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);

  async function fetchProfile() {
    try {
      setLoading(true);
      const currentUserData = await getCurrentUser();
      if (currentUserData.company_id) {
        const company = await fetchCompanyById(currentUserData.company_id);
        currentUserData.company_name = company.name;
      }
      
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

      const reportsData = await fetchReports(currentUserData.id);
      setReports(reportsData);
      console.log("Fetched reports:", reportsData);

      if (isApproval && currentUserData.id) {
        const approverApps = await fetchApplicationsForApprover(currentUserData.id);
        if (Array.isArray(approverApps)) {
          let pending = 0;
          let waiting = 0;

          approverApps.forEach((app: any) => {
            const approvalDataItems = app.approval_data || [];
            const approvalDefinitions = app.approvals || [];

            // Find which approval definitions belong to the current user for this app
            const userApprovalDefIds = approvalDefinitions
              .filter((def: any) => def.user_id === currentUserData.id)
              .map((def: any) => def.id);

            // Filter approval_data items that correspond to the user's approval definitions
            const userApprovalDataItems = approvalDataItems.filter((ad: any) =>
              userApprovalDefIds.includes(ad.approval_id)
            );

            // Count statuses from these items
            userApprovalDataItems.forEach((ad: any) => {
              if (ad.status === "PENDING") pending++;
              if (ad.status === "WAITING") waiting++;
            });
          });

          setPendingCount(pending);
          setWaitingCount(waiting);
        }
      }

      setProfile(currentUserData);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function removeWorker(id: number) {
    return await deleteWorker(id);
  }

  useEffect(() => {
    fetchProfile();
  }, [isApproval, userId]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    workers,
    reports,
    removeWorker,
    pendingCount,
    waitingCount,
  };
}