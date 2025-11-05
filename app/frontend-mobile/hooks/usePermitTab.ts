import { useEffect, useState, useCallback } from "react";
import Constants from "expo-constants";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import { PermitStatus } from "@/constants/Status";
import PermitData from "@/interfaces/interfaces";

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
      // normalize user id to number to avoid string/number mismatches
      const numericUserId = Number(userId);

      // Fetch approval-data and approvals up-front
      const [approvalDataRes, approvalsRes] = await Promise.all([
        fetch(`${API_BASE_URL}api/approval-data/`),
        fetch(`${API_BASE_URL}api/approvals/`),
      ]);

      const allApprovalData = approvalDataRes.ok ? await approvalDataRes.json() : [];
      const allApprovals = approvalsRes.ok ? await approvalsRes.json() : [];

      // Build quick lookup maps
      const approvalsById: Record<number, any> = {};
      allApprovals.forEach((a: any) => {
        approvalsById[a.id] = a;
      });

      // Map workflow_data_id => array of approval-data entries
      const approvalDataByWorkflow: Record<number, any[]> = {};
      allApprovalData.forEach((ad: any) => {
        const wfId = Number(ad.workflow_data_id);
        if (!approvalDataByWorkflow[wfId]) approvalDataByWorkflow[wfId] = [];
        approvalDataByWorkflow[wfId].push(ad);
      });

      // Which approval definitions belong to this user? numeric match.
      const myApprovals = allApprovals.filter((a: any) => Number(a.user_id) === numericUserId);
      const myApprovalIds = myApprovals.map((a: any) => a.id);

      let permitsData: any[] = [];

      if (!isApproval) {
        // Applicant view: fetch only user's own applications
        const res = await fetch(`${API_BASE_URL}api/applications/filter?applicant_id=${numericUserId}`);
        permitsData = res.ok ? await res.json() : [];
      } else {
        // Approver view:
        // Two paths:
        // 1) If this approver already has approval-data rows (PENDING / WAITING / APPROVED), include those workflows.
        // 2) Also include workflows where this approver is configured in approvals (myApprovals), even if approval-data is missing.
        const workflowIdsFromApprovalData: number[] = Array.from(
          new Set(
            allApprovalData
              .filter((ad: any) => myApprovalIds.includes(Number(ad.approval_id)))
              .map((ad: any) => Number(ad.workflow_data_id))
          )
        );

        const workflowIdsFromApprovals = Array.from(
          new Set(
            myApprovals
              .filter((a: any) => a.workflow_id != null)
              .map((a: any) => Number(a.workflow_id))
          )
        );

        // We'll try to pick workflow_data_ids from approval-data first (more precise).
        // If none found in approval-data for those approvals, we attempt to fetch workflow-data to find instances under those workflows.
        const workflowDataIdsToFetch = new Set<number>();

        workflowIdsFromApprovalData.forEach((id: number) => workflowDataIdsToFetch.add(Number(id)));

        // If there are configured approvals pointing to workflows, try to fetch workflow-data list per workflow id.
        // NOTE: this requires API support; We'll attempt a simple fetch per workflow id to get workflow-data entries.
        for (const wfId of workflowIdsFromApprovals) {
          try {
            // This endpoint might differ in your backend; adjust if necessary.
            const wfDataRes = await fetch(`${API_BASE_URL}api/workflow-data/filter?workflow_id=${wfId}`);
            if (wfDataRes.ok) {
              const wfDatas = await wfDataRes.json();
              (wfDatas || []).forEach((wd: any) => workflowDataIdsToFetch.add(Number(wd.id)));
            } else {
              // fallback: try to infer workflow_data_ids from approval-data which belong to same workflow
              (allApprovalData || []).forEach((ad: any) => {
                if (Number(ad.workflow_id) === wfId && ad.workflow_data_id) {
                  workflowDataIdsToFetch.add(Number(ad.workflow_data_id));
                }
              });
            }
          } catch (e) {
            // ignore and continue
            console.warn("[usePermitTab] error fetching workflow-data for workflow", wfId, e);
          }
        }

        // If still empty, as a final fallback, include any workflow_data_id where approval-data exists and that approval-id is in myApprovalIds
        if (workflowDataIdsToFetch.size === 0 && workflowIdsFromApprovalData.length > 0) {
          workflowIdsFromApprovalData.forEach((id) => workflowDataIdsToFetch.add(id));
        }

        // Fetch applications for each workflow_data_id found
        const results = await Promise.all(
          Array.from(workflowDataIdsToFetch).map(async (id: number) => {
            try {
              const res = await fetch(`${API_BASE_URL}api/applications/filter?workflow_data_id=${id}`);
              return res.ok ? await res.json() : [];
            } catch (e) {
              console.warn("[usePermitTab] fetch application for workflow_data_id failed:", id, e);
              return [];
            }
          })
        );

        permitsData = results.flat();
      }

      // Build a map: approval_id -> status (so we preserve per-approver state)
      const approvalStatusByApprovalId: Record<number, string> = {};
      allApprovalData.forEach((ad: any) => {
        if (ad.approval_id) approvalStatusByApprovalId[Number(ad.approval_id)] = ad.status;
      });

      // Enrich permits
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

          // Find all approval-data rows for this workflow_data_id
          const wfId = Number(p.workflow_data_id);
          const approvalRowsForThisWorkflow = approvalDataByWorkflow[wfId] || [];

          // Find the approval-row that belongs to this user (by approval_id membership in myApprovalIds).
          // This will match WAITING and PENDING records tied to your approval definition.
          const myApprovalRow = approvalRowsForThisWorkflow.find((ad: any) =>
            myApprovalIds.includes(Number(ad.approval_id))
          );

          // If we couldn't find a matching approval-data row (rare), attempt to find by role_name via approvals config:
          // e.g., approvalsById[ad.approval_id].user_id may be null in some systems — fallback by role_name.
          let approvalStatus = "-";
          if (myApprovalRow) {
            approvalStatus = approvalStatusByApprovalId[Number(myApprovalRow.approval_id)] ?? myApprovalRow.status ?? "-";
          } else {
            // attempt fallback: find approvals configured for this workflow where user_id === numericUserId
            const approvalsForWorkflow = Object.values(approvalsById).filter((a: any) => Number(a.workflow_id) === Number(workflowData?.workflow_id ?? p.workflow_id));
            const matchedApproval = approvalsForWorkflow.find((a: any) => Number(a.user_id) === numericUserId);
            if (matchedApproval) {
              // find approval-data for that approval id
              const ad = approvalRowsForThisWorkflow.find((r: any) => Number(r.approval_id) === Number(matchedApproval.id));
              if (ad) approvalStatus = ad.status ?? "-";
            }
          }

          return {
            id: p.id,
            name: p.name?.trim() || "-",
            status: p.status,
            approvalStatus,
            location:
              p.location_id && p.location_id <= PLACEHOLDER_THRESHOLD ? "-" : location?.name || "-",
            document:
              p.document_id && p.document_id <= PLACEHOLDER_THRESHOLD ? "-" : document?.name || "-",
            permitType:
              p.permit_type_id && p.permit_type_id <= PLACEHOLDER_THRESHOLD ? "-" : permitType?.name || "-",
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
      enrichedPermits.sort((a, b) => (new Date(b.createdTime ?? 0).getTime() - new Date(a.createdTime ?? 0).getTime()));
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
// import Constants from "expo-constants";
// import { Alert } from "react-native";
// import { useUser } from "@/contexts/UserContext";
// import { PermitStatus } from "@/constants/Status";
// import PermitData from "@/interfaces/interfaces";

// const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
// const PLACEHOLDER_THRESHOLD = 3; // Constants.expoConfig?.extra?.PLACEHOLDER_THRESHOLD;

// export function usePermitTab() {
//   const { userId, isApproval } = useUser();
//   const [permits, setPermits] = useState<PermitData[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchPermits = useCallback(async () => {
//     if (!userId) return;
//     setLoading(true);

//     try {
//       let permitsData: any[] = [];
//       let myApprovalData: any[] = []; // Declare here so it’s visible below

//       const approvalDataRes = await fetch(`${API_BASE_URL}api/approval-data/`);
//       const allApprovalData = await approvalDataRes.json();

//       if (!isApproval) {
//         // Applicant / Contractor view
//         const res = await fetch(`${API_BASE_URL}api/applications/filter?applicant_id=${userId}`);
//         permitsData = await res.json();
//       } else {
//         // Approver view
//         const approvalsRes = await fetch(`${API_BASE_URL}api/approvals/`);
//         const allApprovals = await approvalsRes.json();

//         const numericUserId = Number(userId); // ensure type match
//         const myApprovals = allApprovals.filter((a: any) => a.user_id === numericUserId);

//         myApprovalData = allApprovalData.filter((ad: any) =>
//           myApprovals.map((a: any) => a.id).includes(ad.approval_id)
//         );

//         const workflowDataIds = myApprovalData.map((ad: any) => ad.workflow_data_id);

//         const results = await Promise.all(
//           workflowDataIds.map(async (id: number) => {
//             const res = await fetch(`${API_BASE_URL}api/applications/filter?workflow_data_id=${id}`);
//             return res.json();
//           })
//         );

//         permitsData = results.flat();
//       }

//       // Build map for later lookups
//       const permitApprovalMap: Record<number, string> = {};
//       allApprovalData.forEach((ad: any) => {
//         if (ad.approval_id && ad.workflow_data_id) {
//           permitApprovalMap[ad.approval_id] = ad.status;
//         }
//       });

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

//           const myApproval = myApprovalData.find(
//             (ad: any) => Number(ad.workflow_data_id) === Number(p.workflow_data_id)
//           );

//           return {
//             id: p.id,
//             name: p.name?.trim() || "-",
//             status: p.status,
//             approvalStatus: myApproval ? permitApprovalMap[myApproval.approval_id] : "-",
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

//   // Run on mount / user change
//   useEffect(() => {
//     fetchPermits();
//   }, [fetchPermits]);

//   return { permits, loading, refetch: fetchPermits };
// }

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