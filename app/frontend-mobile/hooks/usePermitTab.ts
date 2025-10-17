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

  // // Main fetch logic
  // const fetchPermits = useCallback(async () => {
  //   if (!userId) return;
  //   setLoading(true);

  //   try {
  //     let permitsData: any[] = [];
  //     let allApprovalData: any[] = [];

  //     if (!isApproval) {
  //       // Applicant / Contractor view
  //       const allApplications = await fetchAllApplications();
  //       permitsData = allApplications.filter((p) => p.applicant_id === userId);
  //     } else {
  //       // Approver view
  //       const approvalsRes = await fetch(`${API_BASE_URL}api/approvals/`);
  //       const allApprovals = await approvalsRes.json();

  //       const myApprovals = allApprovals.filter((a: any) => a.user_id === userId);
  //       const myApprovalIds = myApprovals.map((a: any) => a.id);

  //       // Fetch approval-data
  //       const approvalDataRes = await fetch(`${API_BASE_URL}api/approval-data/`);
  //       allApprovalData = await approvalDataRes.json();

  //       const myApprovalData = allApprovalData.filter((ad: any) =>
  //         myApprovalIds.includes(ad.approval_id)
  //       );

  //       const myWorkflowDataIds = myApprovalData.map(
  //         (ad: any) => ad.workflow_data_id
  //       );

  //       // Fetch applications (permits)
  //       const allApplications = await fetchAllApplications();
  //       permitsData = allApplications.filter((p) =>
  //         myWorkflowDataIds.includes(p.workflow_data_id)
  //       );

  //       // Attach approvalStatus to each permit
  //       permitsData = permitsData.map((p) => {
  //         const approval = myApprovalData.find(
  //           (ad: any) => ad.workflow_data_id === p.workflow_data_id
  //         );
  //         return {
  //           ...p,
  //           approvalStatus: approval?.status || PermitStatus.PENDING, // ✅
  //         };
  //       });
  //     }

  //     // Enrich each permit with related data
  //     const enrichedPermits: PermitData[] = await Promise.all(
  //       permitsData.map(async (p) => {
  //         const [docRes, locRes, typeRes, applicantRes, workflowRes, approvalDataRes] =
  //           await Promise.all([
  //             p.document_id
  //               ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`)
  //               : null,
  //             p.location_id
  //               ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`)
  //               : null,
  //             p.permit_type_id
  //               ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`)
  //               : null,
  //             p.applicant_id
  //               ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`)
  //               : null,
  //             p.workflow_data_id
  //               ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`)
  //               : null,
  //             p.workflow_data_id
  //               ? fetch(`${API_BASE_URL}api/approval-data/?workflow_data_id=${p.workflow_data_id}`)
  //               : null,
  //           ]);

  //         const document = docRes ? await docRes.json() : null;
  //         const location = locRes ? await locRes.json() : null;
  //         const permitType = typeRes ? await typeRes.json() : null;
  //         const applicant = applicantRes ? await applicantRes.json() : null;
  //         const workflowData = workflowRes ? await workflowRes.json() : null;
  //         const approvalDataList = approvalDataRes ? await approvalDataRes.json() : [];

  //         // TEMP - get latest approval for this workflow_data_id
  //         const latestApproval = Array.isArray(approvalDataList) && approvalDataList.length > 0
  //           ? approvalDataList[approvalDataList.length - 1]
  //           : null;

  //         return {
  //           id: p.id,
  //           name: p.name,
  //           status: p.status,
  //           approvalStatus: latestApproval?.status || null,
  //           location: location?.name || "-",
  //           document: document?.name || "-",
  //           permitType: permitType?.name || "-",
  //           workflowData: workflowData?.name || "-",
  //           createdBy: applicant?.name || "Unknown",
  //           createdTime: p.created_time,
  //           workStartTime: workflowData?.start_time,
  //           workEndTime: workflowData?.end_time,
  //           applicantId: p.applicant_id,
  //           documentId: p.document_id,
  //           locationId: p.location_id,
  //           permitTypeId: p.permit_type_id,
  //           workflowDataId: p.workflow_data_id,
  //         };
  //       })
  //     );

  //     // Sort newest first
  //     enrichedPermits.sort((a, b) => {
  //       const dateA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
  //       const dateB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
  //       return dateB - dateA;
  //     });

  //     setPermits(enrichedPermits);
  //   } catch (err: any) {
  //     console.error("Error fetching permits:", err);
  //     Alert.alert("Error", err.message || "Failed to load permits");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [userId, isApproval, fetchAllApplications]);

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