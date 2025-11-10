import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import PermitData from "@/interfaces/interfaces";
import {
  fetchAllApprovalData,
  fetchAllApprovals,
  fetchAllWorkflowData,
  fetchApplicationsByApplicant,
  fetchApplicationsByWorkflowData,
} from "@/services/api";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const PLACEHOLDER_THRESHOLD = 3;

export function usePermitTab() {
  const { userId, isApproval } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const numericUserId = Number(userId);

      // Fetch all required base data
      const [allApprovalData, allApprovals, allWorkflowData] = await Promise.all([
        fetchAllApprovalData(),
        fetchAllApprovals(),
        fetchAllWorkflowData(),
      ]);

      // Filter approvals belonging to this user
      const myApprovals = allApprovals.filter(
        (a: any) =>
          Number(a.user_id) === numericUserId || Number(a.user?.id) === numericUserId
      );

      const myApprovalIds = myApprovals.map((a: any) => Number(a.id));
      const myWorkflowIds = myApprovals.map((a: any) => Number(a.workflow_id));

      // Workflow data IDs from approval-data
      const workflowDataIdsFromApprovalData = Array.from(
        new Set(
          allApprovalData
            .filter((ad: any) => myApprovalIds.includes(Number(ad.approval_id)))
            .map((ad: any) => Number(ad.workflow_data_id))
        )
      );

      // Workflow data IDs from workflows
      const workflowDataIdsFromWorkflows: number[] = [];
      for (const wfId of myWorkflowIds) {
        for (const wd of allWorkflowData) {
          if (Number(wd.workflow_id) === wfId) {
            workflowDataIdsFromWorkflows.push(Number(wd.id));
          }
        }
      }

      // Merge & deduplicate
      const combinedWorkflowDataIds = [
        ...workflowDataIdsFromApprovalData,
        ...workflowDataIdsFromWorkflows,
      ];
      const workflowDataIdsToFetch = new Set(combinedWorkflowDataIds);

      // Fetch permit applications
      let permitsData: any[] = [];

      if (!isApproval) {
        // Applicant — fetch their own permits
        permitsData = await fetchApplicationsByApplicant(numericUserId);
      } else {
        // Approver — fetch permits linked to workflow data they’re involved in
        const results = await Promise.all(
          Array.from(workflowDataIdsToFetch).map(async (id) => {
            try {
              return await fetchApplicationsByWorkflowData(id);
            } catch (e) {
              console.warn("[usePermitTab] fetchApplicationsByWorkflowData failed:", id, e);
              return [];
            }
          })
        );
        permitsData = results.flat();
      }

      // Map approval data per workflow_data_id
      const approvalDataByWorkflow: Record<number, any[]> = {};
      for (const ad of allApprovalData) {
        const wfId = Number(ad.workflow_data_id);
        if (!approvalDataByWorkflow[wfId]) approvalDataByWorkflow[wfId] = [];
        approvalDataByWorkflow[wfId].push(ad);
      }

      // Enrich permits with related data
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

          const wfId = Number(p.workflow_data_id);
          const approvalRows = approvalDataByWorkflow[wfId] || [];

          // Current approver's status
          const myApprovalRow = approvalRows.find((ad: any) =>
            myApprovalIds.includes(Number(ad.approval_id))
          );
          const approvalStatus = myApprovalRow ? myApprovalRow.status : "-";

          // Latest overall workflow status
          let latestApprovalStatus = "-";
          if (approvalRows.some((ad: any) => ad.status === "REJECTED")) {
            latestApprovalStatus = "REJECTED";
          } else if (approvalRows.some((ad: any) => ad.status === "PENDING")) {
            latestApprovalStatus = "PENDING";
          } else if (
            approvalRows.length > 0 &&
            approvalRows.every((ad: any) => ad.status === "APPROVED")
          ) {
            latestApprovalStatus = "APPROVED";
          }

          return {
            id: p.id,
            name: p.name?.trim() || "-",
            status: p.status,
            approvalStatus,       // current approver's own status
            latestApprovalStatus, // overall workflow status
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

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  return { permits, loading, refetch: fetchPermits };
}

// import { useEffect, useState, useCallback } from "react";
// import { Alert } from "react-native";
// import { useUser } from "@/contexts/UserContext";
// import PermitData from "@/interfaces/interfaces";
// import {
//   fetchAllApprovalData,
//   fetchAllApprovals,
//   fetchAllWorkflowData,
//   fetchApplicationsByApplicant,
//   fetchApplicationsByWorkflowData,
// } from "@/services/api";
// import Constants from "expo-constants";

// const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
// const PLACEHOLDER_THRESHOLD = 3;

// export function usePermitTab() {
//   const { userId, isApproval } = useUser();
//   const [permits, setPermits] = useState<PermitData[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchPermits = useCallback(async () => {
//     if (!userId) return;
//     setLoading(true);

//     try {
//       const numericUserId = Number(userId);

//       // Fetch all required base data
//       const [allApprovalData, allApprovals, allWorkflowData] = await Promise.all([
//         fetchAllApprovalData(),
//         fetchAllApprovals(),
//         fetchAllWorkflowData(),
//       ]);

//       // Filter approvals belonging to this user
//       const myApprovals = allApprovals.filter(
//         (a: any) =>
//           Number(a.user_id) === numericUserId || Number(a.user?.id) === numericUserId
//       );

//       const myApprovalIds = myApprovals.map((a: any) => Number(a.id));
//       const myWorkflowIds = myApprovals.map((a: any) => Number(a.workflow_id));

//       // Workflow data IDs from approval-data
//       const workflowDataIdsFromApprovalData = Array.from(
//         new Set(
//           allApprovalData
//             .filter((ad: any) => myApprovalIds.includes(Number(ad.approval_id)))
//             .map((ad: any) => Number(ad.workflow_data_id))
//         )
//       );

//       // Workflow data IDs from workflows
//       const workflowDataIdsFromWorkflows: number[] = [];
//       for (const wfId of myWorkflowIds) {
//         for (const wd of allWorkflowData) {
//           if (Number(wd.workflow_id) === wfId) {
//             workflowDataIdsFromWorkflows.push(Number(wd.id));
//           }
//         }
//       }

//       // Merge & deduplicate
//       const combinedWorkflowDataIds = [
//         ...workflowDataIdsFromApprovalData,
//         ...workflowDataIdsFromWorkflows,
//       ];
//       const workflowDataIdsToFetch = new Set(combinedWorkflowDataIds);

//       // Fetch permit applications
//       let permitsData: any[] = [];

//       if (!isApproval) {
//         // Applicant — fetch their own permits
//         permitsData = await fetchApplicationsByApplicant(numericUserId);
//       } else {
//         // Approver — fetch permits linked to workflow data they’re involved in
//         const results = await Promise.all(
//           Array.from(workflowDataIdsToFetch).map(async (id) => {
//             try {
//               return await fetchApplicationsByWorkflowData(id);
//             } catch (e) {
//               console.warn("[usePermitTab] fetchApplicationsByWorkflowData failed:", id, e);
//               return [];
//             }
//           })
//         );
//         permitsData = results.flat();
//       }

//       // Map approval data per workflow_data_id
//       const approvalDataByWorkflow: Record<number, any[]> = {};
//       for (const ad of allApprovalData) {
//         const wfId = Number(ad.workflow_data_id);
//         if (!approvalDataByWorkflow[wfId]) approvalDataByWorkflow[wfId] = [];
//         approvalDataByWorkflow[wfId].push(ad);
//       }

//       // Enrich permits with related data
//       const enrichedPermits: PermitData[] = await Promise.all(
//         permitsData.map(async (p) => {
//           const [docRes, locRes, typeRes, applicantRes, workflowRes] = await Promise.all([
//             p.document_id ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`) : null,
//             p.location_id ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`) : null,
//             p.permit_type_id ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`) : null,
//             p.applicant_id ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`) : null,
//             p.workflow_data_id ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`) : null,
//           ]);

//           const document = docRes ? await docRes.json() : null;
//           const location = locRes ? await locRes.json() : null;
//           const permitType = typeRes ? await typeRes.json() : null;
//           const applicant = applicantRes ? await applicantRes.json() : null;
//           const workflowData = workflowRes ? await workflowRes.json() : null;

//           const wfId = Number(p.workflow_data_id);
//           const approvalRows = approvalDataByWorkflow[wfId] || [];
//           const myApprovalRow = approvalRows.find((ad: any) =>
//             myApprovalIds.includes(Number(ad.approval_id))
//           );
//           const approvalStatus = myApprovalRow ? myApprovalRow.status : "-";

//           return {
//             id: p.id,
//             name: p.name?.trim() || "-",
//             status: p.status,
//             approvalStatus,
//             location:
//               p.location_id && p.location_id <= PLACEHOLDER_THRESHOLD
//                 ? "-"
//                 : location?.name || "-",
//             document:
//               p.document_id && p.document_id <= PLACEHOLDER_THRESHOLD
//                 ? "-"
//                 : document?.name || "-",
//             permitType:
//               p.permit_type_id && p.permit_type_id <= PLACEHOLDER_THRESHOLD
//                 ? "-"
//                 : permitType?.name || "-",
//             workflowData: workflowData?.name || "-",
//             createdBy: applicant?.name || "-",
//             createdTime: p.created_time,
//             workStartTime: workflowData?.start_time,
//             workEndTime: workflowData?.end_time,
//             applicantId: p.applicant_id,
//             documentId: p.document_id,
//             locationId: p.location_id,
//             permitTypeId: p.permit_type_id,
//             workflowDataId: p.workflow_data_id,
//           };
//         })
//       );

//       // Sort newest first
//       enrichedPermits.sort(
//         (a, b) =>
//           new Date(b.createdTime ?? 0).getTime() -
//           new Date(a.createdTime ?? 0).getTime()
//       );

//       setPermits(enrichedPermits);
//     } catch (err: any) {
//       console.error("Error fetching permits:", err);
//       Alert.alert("Error", err.message || "Failed to load permits");
//     } finally {
//       setLoading(false);
//     }
//   }, [userId, isApproval]);

//   useEffect(() => {
//     fetchPermits();
//   }, [fetchPermits]);

//   return { permits, loading, refetch: fetchPermits };
// }