import { useEffect, useState } from "react";
import { PermitStatus } from "@/constants/Status";
import * as api from "@/services/api";

const PLACEHOLDER_THRESHOLD = 3;

export function usePermitDetails(id?: string) {
  const [permit, setPermit] = useState<any | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [safetyEquipments, setSafetyEquipments] = useState<any[]>([]);
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
        workers: permitData.workers || [],
        safety_equipment: permitData.safety_equipment || [],
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

  return { permit, approvals, approvalData, loading, error, refetch: fetchPermit, workers, safetyEquipments };
}