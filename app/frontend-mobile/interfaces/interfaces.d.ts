interface PermitData {
  id: number;
  name: string;
  status: string;
  location: string;
  document: string;
  permitType?: string;
  workflowData?: string;
  createdBy: string; 
  createdTime: string;
  workStartTime?: string;
  // FKs 
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
}