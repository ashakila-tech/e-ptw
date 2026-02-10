// import { getApiBaseUrlWithOverride, getToken, setToken, removeToken } from './platform';
import { API_BASE_URL as PLATFORM_BASE_URL, getApiBaseUrlWithOverride, getToken, setToken, removeToken } from './platform';

// Prefer Vite/Cra env for web and allow runtime overrides; for Expo, platform.getApiBaseUrlWithOverride() will resolve it at runtime.
// export const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || (typeof window !== 'undefined' ? (window as any).API_BASE_URL : '') || '';
export const API_BASE_URL = PLATFORM_BASE_URL;

// -------------------- Auth --------------------
export async function login(email: string, password: string) {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}auth/login`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  await setToken(data.access_token);
  return data.access_token;
}

export async function logout() {
  // No API call needed for simple token-based auth, just remove the token.
  await removeToken();
}

export async function registerUser(payload: { company_id: number; name: string; email: string; user_type: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Registration failed: ${await res.text()}`);
  return res.json();
}

export async function registerApplicant(payload: { company_id: number; name: string; email: string; user_type: number; password: string }) {
  const res = await fetch(`${API_BASE_URL}auth/register-applicant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to register applicant: ${await res.text()}`);
  return res.json();
}

export async function getCurrentUser() {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const res = await fetch(`${API_BASE_URL}auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Failed to fetch user: ${await res.text()}`);
  return res.json();
} 

// -------------------- Users --------------------
export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}api/users/`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(payload: any) {
  const res = await fetch(`${API_BASE_URL}api/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create user: ${await res.text()}`);
  return res.json();
}

export async function updateUser(id: number, payload: any) {
  const res = await fetch(`${API_BASE_URL}api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update user: ${await res.text()}`);
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_BASE_URL}api/users/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete user: ${await res.text()}`);
  return true;
}

export async function fetchUserById(userId: number) {
  const res = await fetch(`${API_BASE_URL}api/users/${userId}`);
  if (!res.ok) throw new Error(`Failed to fetch user (${res.status})`);
  return res.json();
}

export async function fetchUsersByGroupName(groupName: string) {
  const res = await fetch(`${API_BASE_URL}api/users/by-group-name/${groupName}`);
  if (!res.ok) throw new Error(`Failed to fetch users for group ${groupName}`);
  return res.json();
}

export async function fetchUsersByGroupId(groupId: number) {
  const res = await fetch(`${API_BASE_URL}api/users/by-group-id/${groupId}`);
  if (!res.ok) throw new Error(`Failed to fetch users for group ID ${groupId}`);
  return res.json();
}

export async function fetchUserGroups() {
  const res = await fetch(`${API_BASE_URL}api/user-groups/`);
  if (!res.ok) throw new Error("Failed to fetch user groups");
  return res.json();
}

export async function createUserGroup(payload: { user_id: number; group_id: number }) {
  const res = await fetch(`${API_BASE_URL}api/user-groups/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to assign group: ${await res.text()}`);
  return res.json();
}

export async function deleteUserGroup(id: number) {
  const res = await fetch(`${API_BASE_URL}api/user-groups/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to remove group: ${await res.text()}`);
  return true;
}

export async function updateGroup(id: number, payload: { name: string; company_id?: number }) {
  const res = await fetch(`${API_BASE_URL}api/groups/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update group: ${await res.text()}`);
  return res.json();
}

export async function deleteGroup(id: number) {
  const res = await fetch(`${API_BASE_URL}api/groups/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete group: ${await res.text()}`);
  return true;
}

export async function fetchAllGroups() {
  const res = await fetch(`${API_BASE_URL}api/groups/`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

export async function fetchGroups(companyId: number) {
  const res = await fetch(`${API_BASE_URL}api/groups/options?company_id=${companyId}&page_size=1000`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  const data = await res.json();
  return data.map((item: any) => ({ id: item.value, name: item.label }));
}

export async function createGroup(payload: { company_id: number; name: string }) {
  const res = await fetch(`${API_BASE_URL}api/groups/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create group: ${await res.text()}`);
  return res.json();
}

// Fetch selectable groups (value/label) from the backend. Used by admin dropdowns and the dashboard.
export async function fetchGroupsOptions(params?: { company_id?: number; q?: string; page_size?: number }) {
  const query = [] as string[];
  if (params?.company_id) query.push(`company_id=${params.company_id}`);
  if (params?.q) query.push(`q=${encodeURIComponent(params.q)}`);
  if (params?.page_size) query.push(`page_size=${params.page_size}`);
  const qs = query.length ? `?${query.join('&')}` : '';
  const res = await fetch(`${API_BASE_URL}api/groups/options${qs}`);
  if (!res.ok) throw new Error('Failed to fetch groups');
  return res.json();
}

// -------------------- Companies --------------------
export async function fetchCompanies() {
  const res = await fetch(`${API_BASE_URL}api/companies/`);
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

export async function createCompany(name: string) {
  const res = await fetch(`${API_BASE_URL}api/companies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create company: ${await res.text()}`);
  return res.json();
}

export async function updateCompany(id: number, name: string) {
  const res = await fetch(`${API_BASE_URL}api/companies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to update company: ${await res.text()}`);
  return res.json();
}

export async function deleteCompany(id: number) {
  const res = await fetch(`${API_BASE_URL}api/companies/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete company: ${await res.text()}`);
  return true;
}

export async function fetchCompanyById(companyId: number) {
  const res = await fetch(`${API_BASE_URL}api/companies/${companyId}`);
  if (!res.ok) throw new Error(`Failed to fetch company (${res.status})`);
  return res.json();
}

// -------------------- Locations --------------------
export async function fetchLocations() {
  const res = await fetch(`${API_BASE_URL}api/locations/`);
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export async function fetchLocationById(locationId: number) {
  const res = await fetch(`${API_BASE_URL}api/locations/${locationId}`);
  if (!res.ok) throw new Error(`Failed to fetch location (${res.status})`);
  return res.json();
}

export async function createLocation(name: string, company_id: number = 1) {
  const res = await fetch(`${API_BASE_URL}api/locations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company_id }),
  });
  if (!res.ok) throw new Error(`Failed to create location: ${await res.text()}`);
  return res.json();
}

export async function deleteLocation(id: number) {
  const res = await fetch(`${API_BASE_URL}api/locations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete location: ${await res.text()}`);
  return true;
}

export async function createLocationManager(payload: { user_id: number; location_id: number }) {
  const res = await fetch(`${API_BASE_URL}api/location-managers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create location manager: ${await res.text()}`);
  return res.json();
}

export async function deleteLocationManager(id: number) {
  const res = await fetch(`${API_BASE_URL}api/location-managers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete location manager: ${await res.text()}`);
  return true;
}

export async function fetchLocationManagersByLocation(locationId: number) {
  const res = await fetch(`${API_BASE_URL}api/location-managers/filter?location_id=${locationId}`);
  if (!res.ok) throw new Error(`Failed to fetch location managers: ${res.statusText}`);
  return res.json();
}

export async function fetchLocationForSiteManager(userId: number) {
  const res = await fetch(
    `${API_BASE_URL}api/location-managers/filter?user_id=${userId}`
  );

  if (!res.ok) throw new Error("Failed to fetch location for Site Manager");

  const responseData = await res.json();
  const data = Array.isArray(responseData) ? responseData : responseData.results || [];

  // Fetch location names for each manager
  const enriched = await Promise.all(
    data.map(async (item: any) => {
      try {
        const location = await fetchLocationById(item.location_id);
        return { ...item, location_name: location.name };
      } catch {
        return { ...item, location_name: `Location ID: ${item.location_id}` };
      }
    })
  );

  return enriched;
}

// -------------------- Permit Types --------------------
export async function fetchPermitTypes() {
  const res = await fetch(`${API_BASE_URL}api/permit-types/`);
  if (!res.ok) throw new Error("Failed to fetch permit types");
  return res.json();
}

export async function fetchPermitTypeById(permitTypeId: number) {
  const res = await fetch(`${API_BASE_URL}api/permit-types/${permitTypeId}`);
  if (!res.ok) throw new Error(`Failed to fetch permit type (${res.status})`);
  return res.json();
}

export async function createPermitType(name: string, company_id: number = 1) {
  const res = await fetch(`${API_BASE_URL}api/permit-types/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company_id }),
  });
  if (!res.ok) throw new Error(`Failed to create permit type: ${await res.text()}`);
  return res.json();
}

export async function deletePermitType(id: number) {
  const res = await fetch(`${API_BASE_URL}api/permit-types/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete permit type: ${await res.text()}`);
  return true;
}

export async function createPermitOfficer(payload: { user_id: number; permit_type_id: number }) {
  const res = await fetch(`${API_BASE_URL}api/permit-officers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create permit officer: ${await res.text()}`);
  return res.json();
}

export async function deletePermitOfficer(id: number) {
  const res = await fetch(`${API_BASE_URL}api/permit-officers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete permit officer: ${await res.text()}`);
  return true;
}

export async function fetchPermitOfficersByPermitType(permitTypeId: number) {
  const res = await fetch(`${API_BASE_URL}api/permit-officers/filter?permit_type_id=${permitTypeId}`);
  if (!res.ok) throw new Error(`Failed to fetch permit officers: ${res.statusText}`);
  return res.json();
}

export async function fetchPermitTypeForSafetyOfficer(userId: number) {
  const res = await fetch(
    `${API_BASE_URL}api/permit-officers/filter?user_id=${userId}`
  );

  if (!res.ok) throw new Error("Failed to fetch permit type for Safety Officer");

  const responseData = await res.json();
  const data = Array.isArray(responseData) ? responseData : responseData.results || [];

  // Fetch permit type names for each officer
  const enriched = await Promise.all(
    data.map(async (item: any) => {
      try {
        const permitType = await fetchPermitTypeById(item.permit_type_id);
        return { ...item, permit_type_name: permitType.name };
      } catch {
        return { ...item, permit_type_name: `Permit Type ID: ${item.permit_type_id}` };
      }
    })
  );

  return enriched;
}

// -------------------- Workers --------------------
export async function fetchWorkers(companyId?: number) {
  const url = companyId
    ? `${API_BASE_URL}api/workers/filter?company_id=${companyId}`
    : `${API_BASE_URL}api/workers/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch workers: ${await res.text()}`);
  return res.json();
}

export async function fetchWorkerById(id: number) {
  const res = await fetch(`${API_BASE_URL}api/workers/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch worker: ${await res.text()}`);
  return res.json();
}

export async function createWorker(payload: any) {
  const formData = new FormData();

  // Append all fields from the payload to formData
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      // Handle file object for picture
      if (key === 'picture') {
        if (payload.picture.uri) {
          formData.append('picture', {
            uri: payload.picture.uri,
            name: payload.picture.name,
            type: payload.picture.mimeType || 'image/jpeg',
          } as any);
        } else {
          formData.append('picture', payload.picture);
        }
      } else {
        formData.append(key, payload[key]);
      }
    }
  }

  const res = await fetch(`${API_BASE_URL}api/workers/`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to create worker: ${await res.text()}`);
  return res.json();
}

export async function updateWorker(id: number, payload: any) {
  const formData = new FormData();
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      if (key === 'picture') {
        if (payload.picture?.uri) {
          formData.append('picture', { uri: payload.picture.uri, name: payload.picture.name, type: payload.picture.mimeType || 'image/jpeg' } as any);
        } else {
          formData.append('picture', payload.picture);
        }
      } else {
        formData.append(key, payload[key]);
      }
    }
  }
  const res = await fetch(`${API_BASE_URL}api/workers/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to update worker: ${await res.text()}`);
  return res.json();
}

export async function deleteWorker(id: number) {
  const res = await fetch(`${API_BASE_URL}api/workers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete worker: ${await res.text()}`);
  return true; // DELETE often returns 204 No Content
}

// -------------------- Safety Equipment --------------------
export async function fetchSafetyEquipment() {
  const res = await fetch(`${API_BASE_URL}api/safety-equipments/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch safety equipment: ${await res.text()}`);
  }
  return res.json();
}

export async function createSafetyEquipment(name: string, company_id: number = 1) {
  const res = await fetch(`${API_BASE_URL}api/safety-equipments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company_id }),
  });
  if (!res.ok) throw new Error(`Failed to create safety equipment: ${await res.text()}`);
  return res.json();
}

export async function updateSafetyEquipment(id: number, name: string, company_id: number = 1) {
  const res = await fetch(`${API_BASE_URL}api/safety-equipments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company_id }),
  });
  if (!res.ok) throw new Error(`Failed to update safety equipment: ${await res.text()}`);
  return res.json();
}

export async function deleteSafetyEquipment(id: number) {
  const res = await fetch(`${API_BASE_URL}api/safety-equipments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete safety equipment: ${await res.text()}`);
  return true;
}

// -------------------- Documents --------------------
// export async function uploadDocument(file: any, companyId: number = 1) {
//   const formData = new FormData();
//   formData.append("file", { uri: file.uri, type: file.mimeType || "application/octet-stream", name: file.name } as any);
//   const query = `?company_id=${encodeURIComponent(companyId)}&name=${encodeURIComponent(file.name)}`;
//   const res = await fetch(`${API_BASE_URL}api/documents/upload${query}`, { method: "POST", body: formData, headers: { Accept: "application/json" } });
//   if (!res.ok) throw new Error(`Failed to upload document (${res.status})`);
//   return res.json();
// }
export async function uploadDocument(file: any, companyId: number = 1) {
  // Platform-specific file handling for FormData
  // On web, `file` is a File object. On native, it's an object with `uri`.
  const formData = new FormData();
  if (file instanceof File) {
    // Web environment
    formData.append("file", file, file.name);
  } else {
    // React Native environment
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.name,
    } as any);
  }
  // Add form fields here
  formData.append("company_id", String(companyId));
  formData.append("name", file.name);

  const res = await fetch(`${API_BASE_URL}api/documents/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      // "Content-Type": "multipart/form-data", // Let React Native set this with the boundary
    },
  });

  if (!res.ok) throw new Error(`Failed to upload document (${res.status})`);
  return res.json();
}

export async function fetchDocumentById(documentId: number) {
  const res = await fetch(`${API_BASE_URL}api/documents/${documentId}`);
  if (!res.ok) throw new Error(`Failed to fetch document (${res.status})`);
  return res.json();
}

export async function downloadDocumentById(documentId: number) {
  const token = await getToken();
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE_URL}api/documents/${documentId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to download document (${res.status})`);

  return res.blob();
}

// -------------------- Workflows --------------------
export async function createWorkflow(name: string, company_id: number, permit_type_id: number) {
  const res = await fetch(`${API_BASE_URL}api/workflows/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company_id, permit_type_id }),
  });
  if (!res.ok) throw new Error("Failed to create workflow");
  return res.json();
}

export const fetchAllWorkflowData = () => fetchPaginatedData("api/workflow-data/");

export async function createWorkflowData(payload: any) {
  const res = await fetch(`${API_BASE_URL}api/workflow-data/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create workflow data");
  return res.json();
}

export async function updateWorkflowData(id: number, payload: any) {
  const res = await fetch(`${API_BASE_URL}api/workflow-data/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update workflow data");
  return res.json();
}

export async function fetchWorkflowDataById(workflowDataId: number) {
  const res = await fetch(`${API_BASE_URL}api/workflow-data/${workflowDataId}`);
  if (!res.ok) throw new Error(`Failed to fetch workflow data (${res.status})`);
  return res.json();
}

export async function extendWorkEndTime(workflowDataId: number, newEndTime: string) {
  if (!workflowDataId) throw new Error("Workflow Data ID is required");
  const token = await getToken();
  if (!token) throw new Error("Authentication token not found.");

  const res = await fetch(`${API_BASE_URL}api/workflow-data/${workflowDataId}`, {
    method: "PATCH", // Use PATCH for partial updates
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ end_time: newEndTime }),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to extend work end time");
  return res.json();
}

export async function checkExtensionEligibility(permitId: number) {
  const res = await fetch(`${API_BASE_URL}api/applications/${permitId}/check-extension-eligibility`);
  if (!res.ok) throw new Error("Failed to check extension eligibility");
  return res.json();
}

// -------------------- Applications --------------------
export async function saveApplication(id: number | null, payload: any, isUpdate: boolean) {
  const url = id && isUpdate ? `${API_BASE_URL}api/applications/${id}` : `${API_BASE_URL}api/applications/`;
  const method = id && isUpdate ? "PUT" : "POST";
  const { created_time, updated_time, ...cleanPayload } = payload;
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanPayload) });
  if (!res.ok) throw new Error("Failed to save application");
  return res.json();
}

export async function fetchApplicationById(id: number) {
  const res = await fetch(`${API_BASE_URL}api/applications/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch application (${res.status})`);
  return res.json();
}

export async function fetchApplicationsByApplicant(applicantId: number) {
  const res = await fetch(`${API_BASE_URL}api/applications/filter?applicant_id=${applicantId}`);
  return res.ok ? res.json() : [];
}

export async function fetchApplicationsForApprover(userId: number) {
  const token = await getToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE_URL}api/applications/for-approver?user_id=${userId}`, {
    headers,
  });
  if (!res.ok) throw new Error(`Failed to fetch applications for approver (${res.status})`);
  return res.json();
}

export async function fetchApplicationsByWorkflowData(workflowDataId: number) {
  const res = await fetch(`${API_BASE_URL}api/applications/filter?workflow_data_id=${workflowDataId}`);
  return res.ok ? res.json() : [];
}

export async function fetchAllApplications() {
  return fetchPaginatedData("api/applications/");
}

export async function deleteApplication(id: number) {
  if (!id) throw new Error("Permit ID is required");

  const res = await fetch(`${API_BASE_URL}api/applications/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to delete permit");
  }

  return true; // success
}

// -------------------- Approvals --------------------
export const fetchAllApprovals = () => fetchPaginatedData("api/approvals/");

export async function createApproval(approval: any) {
  const res = await fetch(`${API_BASE_URL}api/approvals/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(approval) });
  if (!res.ok) throw new Error(`Failed to create approval (${res.status})`);
  return res.json();
}

export async function fetchApprovalsByWorkflow(workflowId: number) {
  const res = await fetch(`${API_BASE_URL}api/approvals/filter?workflow_id=${workflowId}`);
  return res.ok ? res.json() : [];
}

// -------------------- Approval Data --------------------
export const fetchAllApprovalData = () => fetchPaginatedData("api/approval-data/");

export async function createApprovalData(approvalData: any) {
  const res = await fetch(`${API_BASE_URL}api/approval-data/`, {
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(approvalData)
  });
  if (!res.ok) throw new Error(`Failed to create approval data (${res.status})`);
  return res.json();
}

export async function fetchApprovalDataByWorkflow(workflowDataId: number) {
  const res = await fetch(`${API_BASE_URL}api/approval-data/filter?workflow_data_id=${workflowDataId}`);
  return res.ok ? res.json() : [];
}

export async function updateApprovalData(data: { id: number; status: string; time: string; remarks?: string; [key: string]: any }) {
  if (!data.id) throw new Error("ApprovalData ID is required");
  const res = await fetch(`${API_BASE_URL}api/approval-data/${data.id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text() || "Failed to update approval data");
  return res.json();
}

// -------------------- Security --------------------
export async function securityConfirmEntry(permitId: number) {
  if (!permitId) throw new Error("Permit ID is required");
  const res = await fetch(`${API_BASE_URL}api/applications/${permitId}/security-confirm-entry`, { method: "POST", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    let message = "";
    try {
      const data = await res.json();
      message = data.message || data.detail || "";
    } catch {
      message = await res.text();
    }
    throw new Error(message || "Failed to confirm entry");
  }
  const result = await res.json();
  return result;
}

export async function confirmJobDone(permitId: number) {
  if (!permitId) throw new Error("Permit ID is required");
  const token = await getToken();
  if (!token) throw new Error("Authentication token not found.");

  const res = await fetch(`${API_BASE_URL}api/applications/${permitId}/job-done`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to confirm job done" }));
    throw new Error(errorData.detail);
  }
  return res.json();
} 

export async function securityConfirmExit(permitId: number) {
  if (!permitId) throw new Error("Permit ID is required");
  const res = await fetch(`${API_BASE_URL}api/applications/${permitId}/security-confirm-exit`, { method: "POST", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    let message = "";
    try {
      const data = await res.json();
      message = data.message || data.detail || "";
    } catch {
      message = await res.text();
    }
    throw new Error(message || "Failed to confirm exit");
  }
  return res.json();
}

export async function fetchServerTime() {
  const res = await fetch(`${API_BASE_URL}api/applications/server-time`);
  if (!res.ok) throw new Error("Failed to fetch server time");
  return res.json();
}

// -------------------- Notifications --------------------
export async function fetchAllNotifications() {
  return fetchPaginatedData("api/notifications/");
}

export async function fetchNotifications(userId: number) {
  const res = await fetch(`${API_BASE_URL}api/notifications/filter?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function sendNotificationToAdmin(payload: { title: string; message: string }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}api/notifications/send-to-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to send notification" }));
    throw new Error(errorData.detail || "Failed to send notification");
  }

  return res.json();
}

export async function sendNotificationToUser(userId: number, payload: { title: string; message: string }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  // The schema NotificationIn requires user_id in the body as well
  const body = { ...payload, user_id: userId };

  const res = await fetch(`${API_BASE_URL}api/notifications/send-to-user/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to send notification" }));
    throw new Error(errorData.detail || "Failed to send notification");
  }

  return res.json();
}

export async function updateNotification(id: number, payload: any) {
  const res = await fetch(`${API_BASE_URL}api/notifications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update notification: ${await res.text()}`);
  return res.json();
}

// -------------------- Feedbacks --------------------
export async function fetchFeedbacks(userId?: number) {
  if (userId) {
    return fetchPaginatedData(`api/feedbacks/filter?user_id=${userId}`);
  }
  return fetchPaginatedData("api/feedbacks/");
}

export async function createFeedback(payload: { user_id: number; title: string; message: string }) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}api/feedbacks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to submit feedback" }));
    throw new Error(errorData.detail || "Failed to submit feedback");
  }
  return res.json();
}

// -------------------- Departments --------------------
export async function fetchDepartments() {
  const res = await fetch(`${API_BASE_URL}api/departments/`);
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function createDepartment(payload: { name: string; company_id: number }) {
  const res = await fetch(`${API_BASE_URL}api/departments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create department: ${await res.text()}`);
  return res.json();
}

export async function fetchDepartmentById(departmentId: number) {
  const res = await fetch(`${API_BASE_URL}api/departments/${departmentId}`);
  if (!res.ok) throw new Error(`Failed to fetch department (${res.status})`);
  return res.json();
}

export async function updateDepartment(id: number, payload: { name?: string; company_id?: number }) {
  const res = await fetch(`${API_BASE_URL}api/departments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update department: ${await res.text()}`);
  return res.json();
}

export async function deleteDepartment(id: number) {
  const res = await fetch(`${API_BASE_URL}api/departments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete department: ${await res.text()}`);
  return true;
}

export async function fetchDepartmentHeads(departmentId: number) {
  const res = await fetch(`${API_BASE_URL}api/department-heads/filter?department_id=${departmentId}`);
  if (!res.ok) throw new Error("Failed to fetch department heads");
  return res.json();
}

export async function fetchAllDepartmentHeads() {
  const res = await fetch(`${API_BASE_URL}api/department-heads/`);
  if (!res.ok) throw new Error("Failed to fetch all department heads");
  return res.json();
}

export async function createDepartmentHead(payload: { user_id: number; department_id: number }) {
  const res = await fetch(`${API_BASE_URL}api/department-heads/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to assign department head: ${await res.text()}`);
  return res.json();
}

export async function deleteDepartmentHead(id: number) {
  const res = await fetch(`${API_BASE_URL}api/department-heads/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to remove department head: ${await res.text()}`);
  return true;
}

export async function fetchDepartmentForHead(userId: number) {
  const res = await fetch(
    `${API_BASE_URL}api/department-heads/filter?user_id=${userId}`
  );

  if (!res.ok) throw new Error("Failed to fetch department for Head");

  const responseData = await res.json();
  const data = Array.isArray(responseData) ? responseData : responseData.results || [];

  // Fetch department names for each head role
  const enriched = await Promise.all(
    data.map(async (item: any) => {
      try {
        const department = await fetchDepartmentById(item.department_id);
        return { ...item, department_name: department.name };
      } catch {
        return { ...item, department_name: `Department ID: ${item.department_id}` };
      }
    })
  );

  return enriched;
}

// -------------------- Reports --------------------
export async function createReport(payload: {
  name: string;
  user_id: number;
  incident_timestamp: string;
  location_id: number;
  description: string;
  department_id?: number | null;
  condition?: string | null;
  concern?: string | null;
  immediate_action?: string | null;
}) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}api/reports/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to submit report" }));
    throw new Error(errorData.detail || "Failed to submit report");
  }

  return res.json();
}

export async function fetchReports(userId?: number) {
  if (userId) {
    return fetchPaginatedData(`api/reports/filter?user_id=${userId}`);
  }
  return fetchPaginatedData("api/reports/");
  // Use filter endpoint to ensure relations (location, user, etc.) are loaded
  // return fetchPaginatedData("api/reports/filter");
}

export async function fetchReportById(id: number) {
  const res = await fetch(`${API_BASE_URL}api/reports/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch report: ${await res.text()}`);
  return res.json();
}

// -------------------- Utility: Paginated Fetch --------------------
export async function fetchPaginatedData<T = any>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let base = API_BASE_URL || await getApiBaseUrlWithOverride();
  // Start with the raw endpoint. The backend will provide the next URL if it's paginated.
  let nextUrl: string | null = base + endpoint;
  // Get token for auth
  const token = await getToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  while (nextUrl) {
    try {
      const res = await fetch(nextUrl, { headers });
      if (!res.ok) break;
      const data: any = await res.json();
      if (Array.isArray(data)) { results.push(...data); break; }
      if (data && Array.isArray(data.results)) { results.push(...data.results); nextUrl = data.next ? (data.next.startsWith("http") ? data.next : `${base}${data.next}`) : null; }
      else break;
    } catch { break; }
  }
  return results;
}