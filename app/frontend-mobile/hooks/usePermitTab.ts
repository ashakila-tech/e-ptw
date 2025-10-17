// OPTIMIZED VERSION — Uncomment after backend restart (uses /applications/filter)
/*
const fetchPermits = useCallback(async () => {
  if (!userId) return;
  setLoading(true);

  try {
    // Step 1: Fetch filtered applications from backend
    // Applicant = by applicant_id, Approver = by company_id (or workflow_id if preferred)
    const url = isApproval
      ? `${API_BASE_URL}api/applications/filter?company_id=1`
      : `${API_BASE_URL}api/applications/filter?applicant_id=${userId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch permits (${res.status})`);
    const data = await res.json();

    // Step 2: (Optional) fetch approval-data for each permit
    const enrichedPermits: PermitData[] = await Promise.all(
      data.map(async (p: any) => {
        let approvalStatus: string | undefined = undefined;

        if (p.workflow_data_id) {
          try {
            const approvalRes = await fetch(
              `${API_BASE_URL}api/approval-data/filter?workflow_data_id=${p.workflow_data_id}`
            );
            if (approvalRes.ok) {
              const approvalData = await approvalRes.json();
              // Latest approval for this workflow
              const latest = approvalData?.[approvalData.length - 1];
              approvalStatus = latest?.status || undefined;
            }
          } catch (err) {
            console.warn("Error fetching approval data:", err);
          }
        }

        // Step 3: fetch related entities
        const [docRes, locRes, typeRes, applicantRes, workflowRes] = await Promise.all([
          p.document_id ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`) : null,
          p.location_id ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`) : null,
          p.permit_type_id ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`) : null,
          p.applicant_id ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`) : null,
          p.workflow_data_id ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`) : null,
        ]);

        const [document, location, permitType, applicant, workflowData] = await Promise.all([
          docRes ? docRes.json() : null,
          locRes ? locRes.json() : null,
          typeRes ? typeRes.json() : null,
          applicantRes ? applicantRes.json() : null,
          workflowRes ? workflowRes.json() : null,
        ]);

        return {
          id: p.id,
          name: p.name,
          status: p.status,
          approvalStatus,
          location: location?.name || "-",
          document: document?.name || "-",
          permitType: permitType?.name || "-",
          workflowData: workflowData?.name || "-",
          createdBy: applicant?.name || "Unknown",
          createdTime: p.created_time,
          workStartTime: workflowData?.start_time,
          workEndTime: workflowData?.end_time,
          applicantId: p.applicant_id,
          documentId: p.document_id,
          locationId: p.location_id,
          permitTypeId: p.permit_type_id,
          workflowDataId: p.workflow_data_id,
        };
      })
    );

    // Step 4: sort by newest first
    enrichedPermits.sort((a, b) => {
      const dateA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
      const dateB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
      return dateB - dateA;
    });

    setPermits(enrichedPermits);
  } catch (err: any) {
    console.error("Error fetching permits (optimized):", err);
    Alert.alert("Error", err.message || "Failed to load permits");
  } finally {
    setLoading(false);
  }
}, [userId, isApproval]);
*/


import { useEffect, useState, useCallback } from "react";
import Constants from "expo-constants";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import { PermitStatus } from "@/constants/Status";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export type PermitData = {
  id: number;
  name: string;
  status: string;
  approvalStatus?: string;
  location: string;
  document: string;
  permitType: string;
  workflowData: string;
  createdBy: string;
  createdTime: string;
  workStartTime?: string;
  workEndTime?: string;
  applicantId?: number;
  documentId?: number;
  locationId?: number;
  permitTypeId?: number;
  workflowDataId?: number;
};

export function usePermitTab() {
  const { userId, isApproval } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch paginated applications
  const fetchAllApplications = useCallback(async () => {
    let page = 1;
    const all: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(`${API_BASE_URL}api/applications/?page=${page}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        all.push(...data);
        page += 1;
      } else {
        hasMore = false;
      }
    }
    return all;
  }, []);

  const fetchPermits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      let permitsData: any[] = [];
      const allApplications = await fetchAllApplications();

      // 🔹 Always fetch approval-data
      const approvalDataRes = await fetch(`${API_BASE_URL}api/approval-data/`);
      const allApprovalData = await approvalDataRes.json();

      if (!isApproval) {
        // Applicant / Contractor view
        permitsData = allApplications.filter((p) => p.applicant_id === userId);
      } else {
        // Approver view
        const approvalsRes = await fetch(`${API_BASE_URL}api/approvals/`);
        const allApprovals = await approvalsRes.json();

        const myApprovals = allApprovals.filter((a: any) => a.user_id === userId);
        const myApprovalIds = myApprovals.map((a: any) => a.id);

        const myApprovalData = allApprovalData.filter((ad: any) =>
          myApprovalIds.includes(ad.approval_id)
        );

        const myWorkflowDataIds = myApprovalData.map(
          (ad: any) => ad.workflow_data_id
        );

        // Filter to only permits the approver is involved with
        permitsData = allApplications.filter((p) =>
          myWorkflowDataIds.includes(p.workflow_data_id)
        );
      }

      // 🔹 Create a map of workflow_data_id → latest approval status
      const permitApprovalMap: Record<number, string> = {};
      allApprovalData.forEach((ad: any) => {
        if (ad.workflow_data_id) {
          permitApprovalMap[ad.workflow_data_id] = ad.status;
        }
      });

      // 🔹 Enrich each permit
      const enrichedPermits: PermitData[] = await Promise.all(
        permitsData.map(async (p) => {
          const [
            docRes,
            locRes,
            typeRes,
            applicantRes,
            workflowRes,
          ] = await Promise.all([
            p.document_id ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`) : null,
            p.location_id ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`) : null,
            p.permit_type_id ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`) : null,
            p.applicant_id ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`) : null,
            p.workflow_data_id ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`) : null,
          ]);

          const document = docRes ? await docRes.json() : null;
          const location = locRes ? await locRes.json() : null;
          const permitType = typeRes ? await typeRes.json() : null;
          const applicant = applicantRes ? await applicantRes.json() : null;
          const workflowData = workflowRes ? await workflowRes.json() : null;

          return {
            id: p.id,
            name: p.name,
            status: p.status,
            approvalStatus: permitApprovalMap[p.workflow_data_id] ?? undefined,
            location: location?.name || "-",
            document: document?.name || "-",
            permitType: permitType?.name || "-",
            workflowData: workflowData?.name || "-",
            createdBy: applicant?.name || "Unknown",
            createdTime: p.created_time,
            workStartTime: workflowData?.start_time,
            workEndTime: workflowData?.end_time,
            applicantId: p.applicant_id,
            documentId: p.document_id,
            locationId: p.location_id,
            permitTypeId: p.permit_type_id,
            workflowDataId: p.workflow_data_id,
          };
        })
      );

      enrichedPermits.sort((a, b) => {
        const dateA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        const dateB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
        return dateB - dateA;
      });

      setPermits(enrichedPermits);
    } catch (err: any) {
      console.error("Error fetching permits:", err);
      Alert.alert("Error", err.message || "Failed to load permits");
    } finally {
      setLoading(false);
    }
  }, [userId, isApproval, fetchAllApplications]);

  // Run on mount / user change
  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  return { permits, loading, refetch: fetchPermits };
}