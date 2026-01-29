import { useEffect, useState } from "react";
import { PermitStatus } from "@/constants/Status";
// import * as api from "@/services/api";
import * as api from "../../shared/services/api";

import { useUser } from "@/contexts/UserContext";
const PLACEHOLDER_THRESHOLD = 3;
const CLOSING_FLOW_LEVEL = 98;

export function usePermitDetails(id?: string) {
  const [permit, setPermit] = useState<any | null>(null);
  const { userId, companyId: userCompanyId, userName } = useUser();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<any[]>([]);
  const [safetyEquipments, setSafetyEquipments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch main permit application
      const permitData = await api.fetchApplicationById(Number(id));
      const timeRes = await api.fetchServerTime();

      console.log("Fetched permit data:", permitData);

      // Helper to log errors for troubleshooting
      const fetchWithLog = async (promise: Promise<any>, name: string) => {
        try {
          return await promise;
        } catch (e: any) {
          console.warn(`[usePermitDetails] Failed to fetch ${name}:`, e.message || e);
          return null;
        }
      };

      // Use nested data if available
      const preloadedDocument = permitData.document;
      const preloadedWorkflowData = permitData.workflow_data;

      // Fetch related resources in parallel
      const [
        applicant,
        fetchedDocument,
        location,
        permitType,
        fetchedWorkflowData,
        jobAssigner,
      ] = await Promise.all([
        permitData.applicant_id ? fetchWithLog(api.fetchUserById(permitData.applicant_id), "applicant") : Promise.resolve(null),
        (!preloadedDocument && permitData.document_id) ? fetchWithLog(api.fetchDocumentById(permitData.document_id), "document") : Promise.resolve(null),
        permitData.location_id ? fetchWithLog(api.fetchLocationById(permitData.location_id), "location") : Promise.resolve(null),
        permitData.permit_type_id ? fetchWithLog(api.fetchPermitTypeById(permitData.permit_type_id), "permitType") : Promise.resolve(null),
        (!preloadedWorkflowData && permitData.workflow_data_id) ? fetchWithLog(api.fetchWorkflowDataById(permitData.workflow_data_id), "workflowData") : Promise.resolve(null),
        permitData.job_assigner_id ? fetchWithLog(api.fetchUserById(permitData.job_assigner_id), "jobAssigner") : Promise.resolve(null),
      ]);

      const document = preloadedDocument || fetchedDocument;
      const workflowData = preloadedWorkflowData || fetchedWorkflowData;

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
      name: permitName,
      documentId,
    } = permit;

    // Find the supervisor (level 1 approver) from the existing approvals list.
    const supervisorApproval = approvals.find(a => a.level === 1);
    const supervisorApprovalData = approvalData.find(ad => ad.level === 1);

    if (!workflowId || !workflowDataId || !supervisorApproval?.user_id) {
      throw new Error("Missing critical permit data to create closing workflow.");
    }

    // LEVEL CLOSING_FLOW_LEVEL (98) — SUPERVISOR "JOB DONE" (PENDING)
    const approval = await api.createApproval({
      company_id: company_id || userCompanyId || 1,
      workflow_id: workflowId,
      user_id: supervisorApproval.user_id,
      name: `${permitName || "Untitled"} - ${supervisorApprovalData?.approver_name || "Supervisor"} - Job Done`,
      role_name: "Supervisor Job Done Confirmation",
      level: CLOSING_FLOW_LEVEL,
    });

    await api.createApprovalData({
      company_id: company_id || userCompanyId || 1,
      approval_id: approval.id,
      document_id: documentId ?? 0,
      workflow_data_id: workflowDataId,
      status: PermitStatus.PENDING,
      approver_name: supervisorApprovalData?.approver_name || "Supervisor",
      role_name: "Supervisor Job Done Confirmation",
      level: CLOSING_FLOW_LEVEL,
    });
  };

  // This function orchestrates the full security confirmation process
  const confirmEntryAndCreateClosingWorkflow = async () => {
    if (!permit) throw new Error("Permit details are not loaded.");

    // Create the closing workflow (e.g., "Job Done" approval)
    await createClosingWorkflow();

    // Activate the permit
    await api.securityConfirmEntry(permit.id);
  };

  const updatePermitApproval = async (approvalDataId: number, status: string, remarks?: string) => {
    if (!permit) throw new Error("Permit details are not loaded.");

    const originalApprovalData = approvalData.find(ad => ad.id === approvalDataId);
    if (!originalApprovalData) {
      throw new Error("Could not find the corresponding approval data to update.");
    }

    const payload: any = {
      ...originalApprovalData,
      status,
      time: new Date().toISOString(),
      // Add the approver's name for the backend to use in notifications
      approver_name: userName,
    };
    if (remarks !== undefined) {
      payload.remarks = remarks;
    }

    // 1. Update the approval status in the backend
    // The backend will now handle sending notifications based on the new status.
    await api.updateApprovalData(payload);

    // 2. Refresh the permit details to reflect changes
    await fetchPermit();
  };

  const confirmPermitExit = async () => {
    if (!permit) throw new Error("Permit details are not loaded.");

    // 1. Call API to confirm exit
    await api.securityConfirmExit(permit.id);

    // 2. Send Notifications
    const title = `Permit Completed: ${permit.name}`;
    const message = `
      <p>DO NOT REPLY TO THIS EMAIL.</p>
      <p>The permit <strong>${permit.name}</strong> has been marked as <strong>COMPLETED</strong>.</p>
      <p>All associated work is now finished and the permit is closed.</p>
      <p>Please check the app for more details.</p>
    `;

    const notifyPromises = [];
    
    // Notify Applicant
    if (permit.applicantId) {
      notifyPromises.push(
        api.sendNotificationToUser(permit.applicantId, { title, message })
          .catch(e => console.warn("Failed to notify applicant:", e))
      );
    }

    // Notify Supervisor (Job Assigner)
    if (permit.job_assigner_id) {
      notifyPromises.push(
        api.sendNotificationToUser(permit.job_assigner_id, { title, message })
          .catch(e => console.warn("Failed to notify supervisor:", e))
      );
    }

    await Promise.all(notifyPromises);

    // 3. Refresh data
    await fetchPermit();
  };

  return { 
    permit, approvals, approvalData, loading, error, refetch: fetchPermit, workers, 
    safetyEquipments, createClosingWorkflow, confirmEntryAndCreateClosingWorkflow, serverTime,
    updatePermitApproval, confirmPermitExit
  };
}