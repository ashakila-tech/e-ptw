import { useEffect, useState } from "react";
import Constants from "expo-constants";
import dayjs from "dayjs";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export function usePermitDetails(id?: string) {
  const [permit, setPermit] = useState<any | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}api/applications/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch permit (${res.status})`);
      const permitData = await res.json();

      const [docRes, locRes, typeRes, workflowRes, assignerRes] = await Promise.all([
        fetch(`${API_BASE_URL}api/documents/${permitData.document_id}`),
        fetch(`${API_BASE_URL}api/locations/${permitData.location_id}`),
        fetch(`${API_BASE_URL}api/permit-types/${permitData.permit_type_id}`),
        fetch(`${API_BASE_URL}api/workflow-data/${permitData.workflow_data_id}`),
        permitData.job_assigner_id
          ? fetch(`${API_BASE_URL}api/users/${permitData.job_assigner_id}`)
          : Promise.resolve(null),
      ]);

      const [document, location, permitType, workflowData, jobAssigner] = await Promise.all([
        docRes.json(),
        locRes.json(),
        typeRes.json(),
        workflowRes.json(),
        assignerRes ? assignerRes.json() : null,
      ]);

    // Fetch approvals and their statuses
    let approvalsList: any[] = [];
    if (workflowData?.workflow_id && workflowData?.id) {
      // Fetch all approval roles for this workflow
      const approvalsRes = await fetch(
        `${API_BASE_URL}api/approvals/filter?workflow_id=${workflowData.workflow_id}`
      );
      if (approvalsRes.ok) {
        approvalsList = await approvalsRes.json();
      }

      // Fetch approval status data (actual approvals made)
      const approvalDataRes = await fetch(
        `${API_BASE_URL}api/approval-data/filter?workflow_data_id=${workflowData.id}`
      );
      const approvalData = approvalDataRes.ok ? await approvalDataRes.json() : [];

      // Merge them: attach status info from approvalData by matching approval_id
      approvalsList = approvalsList.map((a) => {
        const match = approvalData.find(
          (d: any) => d.approval_id === a.id && d.workflow_data_id === workflowData.id
        );
        return {
          ...a,
          status: match?.status || "PENDING", // default to PENDING
          approver_name: match?.approver_name || a.name || "Unknown",
          time: match?.time || null,
        };
      });
    }

      // Enrich approvals
      const enrichedApprovals = await Promise.all(
        approvalsList.map(async (a) => {
          if (a.user_id) {
            const userRes = await fetch(`${API_BASE_URL}api/users/${a.user_id}`);
            if (userRes.ok) {
              const user = await userRes.json();
              a.approver_name = user?.name || "Unknown";
            }
          }
          return a;
        })
      );

      setPermit({
        id: permitData.id,
        name: permitData.name,
        status: permitData.status,
        document: document?.name || "",
        documentUrl: document ? `${API_BASE_URL}uploads/${document.path}` : undefined,
        location: location?.name || "",
        permitType: permitType?.name || "",
        workflowData: workflowData?.name || "",
        createdBy: permitData.created_by ?? "",
        createdTime: permitData.created_time,
        workStartTime: workflowData?.start_time ?? undefined,
        workEndTime: workflowData?.end_time ?? undefined,
        applicantId: permitData.applicant_id,
        documentId: permitData.document_id ?? undefined,
        locationId: permitData.location_id ?? undefined,
        permitTypeId: permitData.permit_type_id ?? undefined,
        workflowDataId: permitData.workflow_data_id ?? undefined,
        jobAssigner: jobAssigner?.name || "-",
      });

      setApprovals(enrichedApprovals);
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

  return { permit, approvals, loading, error, refetch: fetchPermit };
}