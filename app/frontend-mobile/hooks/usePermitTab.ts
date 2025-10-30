import { useEffect, useState, useCallback } from "react";
import Constants from "expo-constants";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import { PermitStatus } from "@/constants/Status";
import PermitData from "@/interfaces/interfaces";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const PLACEHOLDER_THRESHOLD = 3; // Constants.expoConfig?.extra?.PLACEHOLDER_THRESHOLD;

export function usePermitTab() {
  const { userId, isApproval } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      let permitsData: any[] = [];

      // Always fetch approval-data for approvers
      const approvalDataRes = await fetch(`${API_BASE_URL}api/approval-data/`);
      const allApprovalData = await approvalDataRes.json();

      if (!isApproval) {
        // Applicant / Contractor view: fetch only their own applications
        const res = await fetch(`${API_BASE_URL}api/applications/filter?applicant_id=${userId}`);
        permitsData = await res.json();
      } else {
        // Approver view
        const approvalsRes = await fetch(`${API_BASE_URL}api/approvals/`);
        const allApprovals = await approvalsRes.json();

        const myApprovals = allApprovals.filter((a: any) => a.user_id === userId);
        const myApprovalData = allApprovalData.filter((ad: any) =>
          myApprovals.map((a: any) => a.id).includes(ad.approval_id)
        );

        // Collect all workflow_data_ids this approver is responsible for
        const workflowDataIds = myApprovalData.map((ad: any) => ad.workflow_data_id);

        // Fetch applications for each workflow_data_id
        const results = await Promise.all(
          workflowDataIds.map(async (id: number) => {
            const res = await fetch(`${API_BASE_URL}api/applications/filter?workflow_data_id=${id}`);
            return res.json();
          })
        );

        // Flatten results
        permitsData = results.flat();
      }

      // Map workflow_data_id → approval status
      const permitApprovalMap: Record<number, string> = {};
      allApprovalData.forEach((ad: any) => {
        if (ad.workflow_data_id) {
          permitApprovalMap[ad.workflow_data_id] = ad.status;
        }
      });

      // Enrich permit data with related details
      // const enrichedPermits: PermitData[] = await Promise.all(
      //   permitsData.map(async (p) => {
      //     const [
      //       docRes,
      //       locRes,
      //       typeRes,
      //       applicantRes,
      //       workflowRes,
      //     ] = await Promise.all([
      //       p.document_id ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`) : null,
      //       p.location_id ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`) : null,
      //       p.permit_type_id ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`) : null,
      //       p.applicant_id ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`) : null,
      //       p.workflow_data_id ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`) : null,
      //     ]);

      //     const document = docRes ? await docRes.json() : null;
      //     const location = locRes ? await locRes.json() : null;
      //     const permitType = typeRes ? await typeRes.json() : null;
      //     const applicant = applicantRes ? await applicantRes.json() : null;
      //     const workflowData = workflowRes ? await workflowRes.json() : null;

      //     return {
      //       id: p.id,
      //       name: p.name,
      //       status: p.status,
      //       approvalStatus: permitApprovalMap[p.workflow_data_id] ?? "-",
      //       location: location?.name || "-",
      //       document: document?.name || "-",
      //       permitType: permitType?.name || "-",
      //       workflowData: workflowData?.name || "-",
      //       createdBy: applicant?.name || "Unknown",
      //       createdTime: p.created_time,
      //       workStartTime: workflowData?.start_time,
      //       workEndTime: workflowData?.end_time,
      //       applicantId: p.applicant_id,
      //       documentId: p.document_id,
      //       locationId: p.location_id,
      //       permitTypeId: p.permit_type_id,
      //       workflowDataId: p.workflow_data_id,
      //     };
      //   })
      // );

      const enrichedPermits: PermitData[] = await Promise.all(
        permitsData.map(async (p) => {
          const [docRes, locRes, typeRes, applicantRes, workflowRes] = await Promise.all([
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
            name: p.name && p.name.trim() !== "" ? p.name : "-",
            status: p.status,
            approvalStatus: permitApprovalMap[p.workflow_data_id] ?? "-",
            location:
              p.location_id && p.location_id <= PLACEHOLDER_THRESHOLD
                ? "-"
                : location?.name || "-",
            document:
              p.document_id && p.document_id <= PLACEHOLDER_THRESHOLD
                ? "-"
                : document?.name || "-",
            permitType:
              p.permit_type_id && p.permit_type_id <= PLACEHOLDER_THRESHOLD
                ? "-"
                : permitType?.name || "-",
            workflowData: workflowData?.name || "-",
            createdBy: applicant?.name || "-",
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

      // Sort newest first
      enrichedPermits.sort(
        (a, b) =>
          new Date(b.createdTime ?? 0).getTime() -
          new Date(a.createdTime ?? 0).getTime()
      );

      setPermits(enrichedPermits);
    } catch (err: any) {
      console.error("Error fetching permits:", err);
      Alert.alert("Error", err.message || "Failed to load permits");
    } finally {
      setLoading(false);
    }
  }, [userId, isApproval]);

  // Run on mount / user change
  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  return { permits, loading, refetch: fetchPermits };
}

// Backup of previous fetchPermits implementation

  // // Helper to fetch paginated applications
  // const fetchAllApplications = useCallback(async () => {
  //   let page = 1;
  //   const all: any[] = [];
  //   let hasMore = true;

  //   while (hasMore) {
  //     const res = await fetch(`${API_BASE_URL}api/applications/?page=${page}`);
  //     const data = await res.json();
  //     if (Array.isArray(data) && data.length > 0) {
  //       all.push(...data);
  //       page += 1;
  //     } else {
  //       hasMore = false;
  //     }
  //   }
  //   return all;
  // }, []);

  // const fetchPermits = useCallback(async () => {
  //   if (!userId) return;
  //   setLoading(true);

  //   try {
  //     let permitsData: any[] = [];
  //     const allApplications = await fetchAllApplications();

  //     // Always fetch approval-data
  //     const approvalDataRes = await fetch(`${API_BASE_URL}api/approval-data/`);
  //     const allApprovalData = await approvalDataRes.json();

  //     if (!isApproval) {
  //       // Applicant / Contractor view
  //       permitsData = allApplications.filter((p) => p.applicant_id === userId);
  //     } else {
  //       // Approver view
  //       const approvalsRes = await fetch(`${API_BASE_URL}api/approvals/`);
  //       const allApprovals = await approvalsRes.json();

  //       const myApprovals = allApprovals.filter((a: any) => a.user_id === userId);
  //       const myApprovalIds = myApprovals.map((a: any) => a.id);

  //       const myApprovalData = allApprovalData.filter((ad: any) =>
  //         myApprovalIds.includes(ad.approval_id)
  //       );

  //       const myWorkflowDataIds = myApprovalData.map(
  //         (ad: any) => ad.workflow_data_id
  //       );

  //       // Filter to only permits the approver is involved with
  //       permitsData = allApplications.filter((p) =>
  //         myWorkflowDataIds.includes(p.workflow_data_id)
  //       );
  //     }

  //     // Create a map of workflow_data_id → latest approval status
  //     const permitApprovalMap: Record<number, string> = {};
  //     allApprovalData.forEach((ad: any) => {
  //       if (ad.workflow_data_id) {
  //         permitApprovalMap[ad.workflow_data_id] = ad.status;
  //       }
  //     });

  //     // Enrich each permit
  //     const enrichedPermits: PermitData[] = await Promise.all(
  //       permitsData.map(async (p) => {
  //         const [
  //           docRes,
  //           locRes,
  //           typeRes,
  //           applicantRes,
  //           workflowRes,
  //         ] = await Promise.all([
  //           p.document_id ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`) : null,
  //           p.location_id ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`) : null,
  //           p.permit_type_id ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`) : null,
  //           p.applicant_id ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`) : null,
  //           p.workflow_data_id ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`) : null,
  //         ]);

  //         const document = docRes ? await docRes.json() : null;
  //         const location = locRes ? await locRes.json() : null;
  //         const permitType = typeRes ? await typeRes.json() : null;
  //         const applicant = applicantRes ? await applicantRes.json() : null;
  //         const workflowData = workflowRes ? await workflowRes.json() : null;

  //         return {
  //           id: p.id,
  //           name: p.name,
  //           status: p.status,
  //           approvalStatus: permitApprovalMap[p.workflow_data_id] ?? "-",
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