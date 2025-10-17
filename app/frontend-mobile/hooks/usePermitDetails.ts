import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { PermitStatus } from "@/constants/Status";

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
      // Fetch base permit
      const res = await fetch(`${API_BASE_URL}api/applications/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch permit (${res.status})`);
      const permitData = await res.json();

      // Fetch related entities
      const [apNameRes, docRes, locRes, typeRes, workflowRes, assignerRes] = await Promise.all([
        fetch(`${API_BASE_URL}api/users/${permitData.applicant_id}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}api/documents/${permitData.document_id}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}api/locations/${permitData.location_id}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}api/permit-types/${permitData.permit_type_id}`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}api/workflow-data/${permitData.workflow_data_id}`, { cache: "no-store" }),
        permitData.job_assigner_id
          ? fetch(`${API_BASE_URL}api/users/${permitData.job_assigner_id}`, { cache: "no-store" })
          : Promise.resolve(null),
      ]);

      const [applicantName, document, location, permitType, workflowData, jobAssigner] =
        await Promise.all([
          apNameRes.json(),
          docRes.json(),
          locRes.json(),
          typeRes.json(),
          workflowRes.json(),
          assignerRes ? assignerRes.json() : null,
        ]);

      // Fetch approvals and their current statuses
      let approvalsList: any[] = [];
      if (workflowData?.workflow_id && workflowData?.id) {
        // Get workflow roles
        const approvalsRes = await fetch(
          `${API_BASE_URL}api/approvals/filter?workflow_id=${workflowData.workflow_id}`,
          { cache: "no-store" }
        );
        if (approvalsRes.ok) {
          approvalsList = await approvalsRes.json();
        }

        // Get approval data (actual actions)
        const approvalDataRes = await fetch(
          `${API_BASE_URL}api/approval-data/filter?workflow_data_id=${workflowData.id}`,
          { cache: "no-store" }
        );
        const approvalData = approvalDataRes.ok ? await approvalDataRes.json() : [];

        // Merge approval roles with actual approval data
        approvalsList = approvalsList.map((a) => {
          const match = approvalData.find(
            (d: any) =>
              String(d.approval_id) === String(a.id) &&
              String(d.workflow_data_id) === String(workflowData.id)
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

        console.log("approvalData from API:", approvalData);
      }

      // Enrich approvals with actual user names
      const enrichedApprovals = await Promise.all(
        approvalsList.map(async (a) => {
          if (a.user_id) {
            const userRes = await fetch(`${API_BASE_URL}api/users/${a.user_id}`, { cache: "no-store" });
            if (userRes.ok) {
              const user = await userRes.json();
              a.approver_name = user?.name || a.approver_name || "Unknown";
            }
          }
          return a;
        })
      );

      // Final permit data object
      setPermit({
        id: permitData.id,
        name: permitData.name,
        status: permitData.status,
        document: document?.name || "-",
        documentUrl: document ? `${API_BASE_URL}uploads/${document.path}` : undefined,
        location: location?.name || "-",
        permitType: permitType?.name || "-",
        workflowData: workflowData?.name || "-",
        createdBy: permitData.created_by ?? "",
        createdTime: permitData.created_time,
        workStartTime: workflowData?.start_time ?? undefined,
        workEndTime: workflowData?.end_time ?? undefined,
        applicantId: permitData.applicant_id,
        applicantName: applicantName?.name || "-",
        documentId: permitData.document_id ?? undefined,
        locationId: permitData.location_id ?? undefined,
        permitTypeId: permitData.permit_type_id ?? undefined,
        workflowDataId: permitData.workflow_data_id ?? undefined,
        jobAssigner: jobAssigner?.name || "-",
      });

      console.log("merged approvals:", approvalsList);

      // Set updated approval statuses
      setApprovals(enrichedApprovals);
      console.log(enrichedApprovals);
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