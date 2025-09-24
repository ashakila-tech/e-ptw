interface PermitData {
  id: number;
  name: string;
  status: string;
  location: string;
  document: string;
  documentUrl?: string;
  permitType?: string;
  workflowData?: string;
  createdBy: string;
  createdTime: string;
  workStartTime?: string;
  workEndTime?: string;
  applicantId: number;
  documentId?: number;
  locationId?: number;
  permitTypeId?: number;
  workflowDataId?: number;
}

interface PermitAPI {
  id: number;
  name: string;
  status: string;
  applicant_id: number;
  document_id: number | null;
  location_id: number | null;
  permit_type_id: number | null;
  workflow_data_id: number | null;
  created_time: string;
  updated_time: string | null;
  work_start_time?: string | null;
  created_by: string | null;
  updated_by: string | null;
  document_name?: string;
  location_name?: string;
  permit_type_name?: string;
}

interface Application {
  id: number;
  name: string;
  status: string;
  permit_type: { id: number; name: string };
  location: { id: number; name: string };
  document: { id: number; name: string };
  created_by: string | null;
  workflow_data_id: number;
}

interface WorkflowData {
  id: number;
  name: string;
  start_time: string;
  end_time: string | null;
  workflow: { id: number; name: string };
}

interface ApprovalData {
  id: number;
  approver_name: string;
  role_name: string;
  level: number;
  status: string;
  time: string;
}

interface ApprovalItem {
  id?: number;
  approver_name?: string;
  approverName?: string;
  role_name?: string;
  roleName?: string;
  level?: number;
  status?: string;
  time?: string;
  timestamp?: string;
  [k: string]: any;
};
