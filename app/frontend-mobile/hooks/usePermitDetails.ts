import { useEffect, useState } from "react";
import { PermitStatus } from "@/constants/Status";
import * as api from "@/services/api";

const PLACEHOLDER_THRESHOLD = 3;

export function usePermitDetails(id?: string) {
  const [permit, setPermit] = useState<any | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch main permit application
      const permitData = await api.fetchApplicationById(Number(id));

      // Fetch related resources in parallel
      const [
        applicant,
        document,
        location,
        permitType,
        workflowData,
        jobAssigner,
      ] = await Promise.all([
        api.fetchUserById(permitData.applicant_id),
        permitData.document_id ? api.fetchDocumentById(permitData.document_id) : Promise.resolve(null),
        permitData.location_id ? api.fetchLocationById(permitData.location_id) : Promise.resolve(null),
        permitData.permit_type_id ? api.fetchPermitTypeById(permitData.permit_type_id) : Promise.resolve(null),
        permitData.workflow_data_id ? api.fetchWorkflowDataById(permitData.workflow_data_id) : Promise.resolve(null),
        permitData.job_assigner_id ? api.fetchUserById(permitData.job_assigner_id) : Promise.resolve(null),
      ]);

      // Fetch approvals and approval data
      let approvalsList: any[] = [];
      let approvalDataFetched: any[] = [];

      if (workflowData?.workflow_id && workflowData?.id) {
        approvalsList = await api.fetchApprovalsByWorkflow(workflowData.workflow_id);
        approvalDataFetched = await api.fetchApprovalDataByWorkflow(workflowData.id);

        // Merge status from approval data
        approvalsList = approvalsList.map(a => {
          const match = approvalDataFetched.find(d =>
            Number(d.approval_id) === Number(a.id) &&
            Number(d.workflow_data_id) === Number(workflowData.id)
          );
          return {
            ...a,
            user_id: a.user_id,
            status: match?.status || PermitStatus.PENDING,
            approver_name: match?.approver_name || a.name || "Unknown",
            time: match?.time || null,
            company_id: match?.company_id || permitData.company_id || 1,
          };
        });
      }

      setApprovalData(approvalDataFetched);

      // Build enriched permit object
      setPermit({
        id: permitData.id,
        name: permitData.name?.trim() || "-",
        status: permitData.status,
        document:
          permitData.document_id && permitData.document_id <= PLACEHOLDER_THRESHOLD
            ? "-"
            : document?.name || "-",
        documentUrl:
          permitData.document_id && permitData.document_id > PLACEHOLDER_THRESHOLD
            ? `${document?.download_url}`
            : undefined,
        location:
          permitData.location_id && permitData.location_id <= PLACEHOLDER_THRESHOLD
            ? "-"
            : location?.name || "-",
        permitType:
          permitData.permit_type_id && permitData.permit_type_id <= PLACEHOLDER_THRESHOLD
            ? "-"
            : permitType?.name || "-",
        workflowData: workflowData?.name || "-",
        createdBy: permitData.created_by ?? "-",
        createdTime: permitData.created_time,
        workStartTime: workflowData?.start_time ?? undefined,
        workEndTime: workflowData?.end_time ?? undefined,
        applicantId: permitData.applicant_id,
        applicantName: applicant?.name || "-",
        documentId: permitData.document_id ?? undefined,
        locationId: permitData.location_id ?? undefined,
        permitTypeId: permitData.permit_type_id ?? undefined,
        workflowDataId: permitData.workflow_data_id ?? undefined,
        jobAssigner: jobAssigner?.name || "-",
      });

      setApprovals(approvalsList);
    } catch (err: any) {
      console.error("Error fetching permit details:", err);
      setError(err.message || "Failed to fetch permit details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  return { permit, approvals, approvalData, loading, error, refetch: fetchPermit };
}

// import { useEffect, useState } from "react";
// import Constants from "expo-constants";
// import { PermitStatus } from "@/constants/Status";

// const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
// const PLACEHOLDER_THRESHOLD = 3;

// export function usePermitDetails(id?: string) {
//   const [permit, setPermit] = useState<any | null>(null);
//   const [approvals, setApprovals] = useState<any[]>([]);
//   const [approvalData, setApprovalData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchPermit = async () => {
//     if (!id) return;
//     setLoading(true);
//     setError(null);

//     try {
//       // Base application
//       const res = await fetch(`${API_BASE_URL}api/applications/${id}`, { cache: "no-store" });
//       if (!res.ok) throw new Error(`Failed to fetch permit (${res.status})`);
//       const permitData = await res.json();

//       const [
//         apNameRes,
//         docRes,
//         locRes,
//         typeRes,
//         workflowRes,
//         assignerRes,
//       ] = await Promise.all([
//         fetch(`${API_BASE_URL}api/users/${permitData.applicant_id}`, { cache: "no-store" }),
//         fetch(`${API_BASE_URL}api/documents/${permitData.document_id}`, { cache: "no-store" }),
//         fetch(`${API_BASE_URL}api/locations/${permitData.location_id}`, { cache: "no-store" }),
//         fetch(`${API_BASE_URL}api/permit-types/${permitData.permit_type_id}`, { cache: "no-store" }),
//         fetch(`${API_BASE_URL}api/workflow-data/${permitData.workflow_data_id}`, { cache: "no-store" }),
//         permitData.job_assigner_id
//           ? fetch(`${API_BASE_URL}api/users/${permitData.job_assigner_id}`, { cache: "no-store" })
//           : Promise.resolve(null),
//       ]);

//       const [applicantName, document, location, permitType, workflowData, jobAssigner] =
//         await Promise.all([
//           apNameRes.json(),
//           docRes.json(),
//           locRes.json(),
//           typeRes.json(),
//           workflowRes.json(),
//           assignerRes ? assignerRes.json() : null,
//         ]);

//       // Approvals
//       let approvalsList: any[] = [];

//       if (workflowData?.workflow_id && workflowData?.id) {
//         const approvalsRes = await fetch(
//           `${API_BASE_URL}api/approvals/filter?workflow_id=${workflowData.workflow_id}`,
//           { cache: "no-store" }
//         );

//         const approvalDataRes = await fetch(
//           `${API_BASE_URL}api/approval-data/filter?workflow_data_id=${workflowData.id}`,
//           { cache: "no-store" }
//         );

//         const approvalsRaw = approvalsRes.ok ? await approvalsRes.json() : [];
//         const approvalDataFetched = approvalDataRes.ok ? await approvalDataRes.json() : [];

//         approvalsList = approvalsRaw.map((a: any) => {
//           const match = approvalDataFetched.find(
//             (d: any) =>
//               Number(d.approval_id) === Number(a.id) &&
//               Number(d.workflow_data_id) === Number(workflowData.id)
//           );

//           return {
//             ...a,
//             user_id: a.user_id,
//             status: match?.status || PermitStatus.PENDING,
//             approver_name: match?.approver_name || a.name || "Unknown",
//             time: match?.time || null,
//             company_id: match?.company_id || permitData.company_id || 1,
//           };
//         });

//         if (approvalsList.length === 0 && approvalDataFetched.length > 0) {
//           approvalsList = approvalDataFetched.map((d: any) => ({
//             id: d.approval_id,
//             user_id: d.user_id,
//             role_name: d.role_name || "Job Assigner",
//             approver_name: d.approver_name || "Unknown",
//             status: d.status || PermitStatus.PENDING,
//             time: d.time,
//             company_id: d.company_id,
//           }));
//         }

//         setApprovalData(approvalDataFetched);
//       }

//       // Enrich user names
//       const enrichedApprovals = await Promise.all(
//         approvalsList.map(async (a) => {
//           if (a.user_id) {
//             const userRes = await fetch(`${API_BASE_URL}api/users/${a.user_id}`, { cache: "no-store" });
//             if (userRes.ok) {
//               const user = await userRes.json();
//               a.approver_name = user?.name || a.approver_name || "Unknown";
//             }
//           }
//           return a;
//         })
//       );

//       setPermit({
//         id: permitData.id,
//         name: permitData.name?.trim() || "-",
//         status: permitData.status,
//         document:
//           permitData.document_id && permitData.document_id <= PLACEHOLDER_THRESHOLD
//             ? "-"
//             : document?.name || "-",
//         documentUrl:
//           permitData.document_id && permitData.document_id <= PLACEHOLDER_THRESHOLD
//             ? undefined
//             : document
//             ? `${API_BASE_URL}api/documents/${document?.id}/download`
//             : undefined,
//         location:
//           permitData.location_id && permitData.location_id <= PLACEHOLDER_THRESHOLD
//             ? "-"
//             : location?.name || "-",
//         permitType:
//           permitData.permit_type_id && permitData.permit_type_id <= PLACEHOLDER_THRESHOLD
//             ? "-"
//             : permitType?.name || "-",
//         workflowData: workflowData?.name || "-",
//         createdBy: permitData.created_by ?? "-",
//         createdTime: permitData.created_time,
//         workStartTime: workflowData?.start_time ?? undefined,
//         workEndTime: workflowData?.end_time ?? undefined,
//         applicantId: permitData.applicant_id,
//         applicantName: applicantName?.name || "-",
//         documentId: permitData.document_id ?? undefined,
//         locationId: permitData.location_id ?? undefined,
//         permitTypeId: permitData.permit_type_id ?? undefined,
//         workflowDataId: permitData.workflow_data_id ?? undefined,
//         jobAssigner: jobAssigner?.name || "-",
//       });

//       setApprovals(enrichedApprovals);
//     } catch (err: any) {
//       console.error("Error fetching permit details:", err);
//       setError(err.message || "Failed to fetch permit details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPermit();
//   }, [id]);

//   return { permit, approvals, approvalData, loading, error, refetch: fetchPermit };
// }