import { apiFetch } from "./client";
import { PermitStatus } from "@/constants/Status";

export const createApproval = (approval: any) =>
  apiFetch("api/approvals/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approval),
  });

export const createApprovalData = (approvalData: {
  company_id: number;
  approval_id: number;
  document_id: number;
  workflow_data_id: number;
  status: PermitStatus;
  approver_name: string;
  role_name: string;
  level: number;
}) =>
  apiFetch("api/approval-data/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approvalData),
  });

export const fetchAllApprovals = () =>
  apiFetch("api/approvals/");

export const fetchAllApprovalData = () =>
  apiFetch("api/approval-data/");
