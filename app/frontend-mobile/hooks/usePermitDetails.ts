import { useEffect, useState } from "react";
import { PermitStatus } from "@/constants/Status";
import * as api from "@/services/api";

import { useUser } from "@/contexts/UserContext";
const PLACEHOLDER_THRESHOLD = 3;

export function usePermitDetails(id?: string) {
  const [permit, setPermit] = useState<any | null>(null);
  const { userId, companyId: userCompanyId } = useUser();
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
            role_name: match?.custom_role || a.role_name, // Prefer custom role name if it exists
            approver_name: match?.approver_name || a.name || "Unknown",
            time: match?.time || null,
            remarks: match?.remarks || null,
            company_id: match?.company_id || permitData.company_id || 1,
          };
        });

        // Manually add "Job Done" for supervisor if it exists in approvalData but not in approvalsList
        // const jobDoneApprovalData = approvalDataFetched.find(d => d.level === 98);
        // if (jobDoneApprovalData && !approvalsList.some(a => a.level === 98)) {
        //   approvalsList.push({
        //     ...jobDoneApprovalData, role_name: "Job Done Confirmation", approver_name: "Supervisor", time: jobDoneApprovalData.time, remarks: jobDoneApprovalData.remarks
        //   });
        // }
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
        // documentType: document?.type,
          permitData.document_id && permitData.document_id <= PLACEHOLDER_THRESHOLD
            ? "-"
            : document?.path || "-",
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
        job_assigner_id: permitData.job_assigner_id,
        workflowId: workflowData?.workflow_id,
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

  // This function creates the closing workflow steps (e.g., "Job Done" for supervisor)
  const createClosingWorkflow = async () => {
    if (!permit) throw new Error("Permit details are not loaded.");

    const {
      company_id,
      workflowId,
      workflowDataId,
      job_assigner_id,
      jobAssigner,
      name: permitName,
      documentId,
    } = permit;

    // Find the supervisor (level 1 approver) from the existing approvals list.
    const supervisorApproval = approvals.find(a => a.level === 1);
    const supervisorApprovalData = approvalData.find(ad => ad.level === 1);
    // const supervisorId = job_assigner_id || supervisorApproval?.user_id;

    console.log(approvals);

    if (!workflowId || !workflowDataId || !supervisorApproval?.user_id) {
      throw new Error("Missing critical permit data to create closing workflow.");
    }

    // LEVEL 98 — SUPERVISOR "JOB DONE" (PENDING)
    const approval = await api.createApproval({
      company_id: company_id || userCompanyId || 1,
      workflow_id: workflowId,
      user_id: !supervisorApproval?.user_id,
      name: `${permitName || "Untitled"} - ${supervisorApprovalData?.approver_name || "Supervisor"} - Job Done`,
      role_name: "Supervisor Job Done Confirmation",
      level: 98, // Closing flow level
    });

    await api.createApprovalData({
      company_id: company_id || userCompanyId || 1,
      approval_id: approval.id,
      document_id: documentId ?? 0,
      workflow_data_id: workflowDataId,
      status: PermitStatus.PENDING,
      approver_name: supervisorApprovalData?.approver_name || "Supervisor",
      role_name: "Supervisor Job Done Confirmation",
      level: 98,
    });
  };

  // This function orchestrates the full security confirmation process
  const confirmEntryAndCreateClosingWorkflow = async () => {
    if (!permit) throw new Error("Permit details are not loaded.");

    // Step 1: Create the closing workflow (e.g., "Job Done" approval)
    await createClosingWorkflow();

    // Step 2: Activate the permit
    await api.confirmSecurity(permit.id);
  };

  return { permit, approvals, approvalData, loading, error, refetch: fetchPermit, workers, safetyEquipments, createClosingWorkflow, confirmEntryAndCreateClosingWorkflow };
}