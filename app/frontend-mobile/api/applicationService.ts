import { apiFetch } from "./client";

export const saveApplication = (
  id: number | null,
  payload: any,
  isUpdate: boolean
) => {
  const endpoint =
    id && isUpdate ? `api/applications/${id}` : `api/applications/`;
  const method = id && isUpdate ? "PUT" : "POST";
  const { created_time, updated_time, ...cleanPayload } = payload;

  return apiFetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload),
  });
};

export const fetchApplicationsByApplicant = (applicantId: number) =>
  apiFetch(`api/applications/filter?applicant_id=${applicantId}`);

export const fetchApplicationsByWorkflowData = (workflowDataId: number) =>
  apiFetch(`api/applications/filter?workflow_data_id=${workflowDataId}`);

export const fetchPermitOfficersByPermitType = (permitTypeId: number) =>
  apiFetch(`api/permit-officers/filter?permit_type_id=${permitTypeId}`);