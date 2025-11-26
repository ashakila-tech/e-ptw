import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PermitStatus } from "@/constants/Status";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

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
  await AsyncStorage.setItem("access_token", data.access_token);
  return data.access_token;
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
  const token = await AsyncStorage.getItem("access_token");
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

// -------------------- Companies --------------------
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

  const data = await res.json();

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

  const data = await res.json();

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
  const res = await fetch(`${API_BASE_URL}api/workers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create worker: ${await res.text()}`);
  return res.json();
}

export async function updateWorker(id: number, payload: any) {
  const res = await fetch(`${API_BASE_URL}api/workers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
export async function fetchSafetyEquipments() {
  const res = await fetch(`${API_BASE_URL}api/safety-equipments/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch safety equipment: ${await res.text()}`);
  }
  return res.json();
}

export async function createSafetyEquipment(payload: any) {
  const res = await fetch(`${API_BASE_URL}api/safety-equipments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create safety equipment: ${await res.text()}`);
  return res.json();
}

// -------------------- Documents --------------------
export async function uploadDocument(file: any, companyId: number = 1) {
  const formData = new FormData();
  formData.append("file", { uri: file.uri, type: file.mimeType || "application/octet-stream", name: file.name } as any);
  const query = `?company_id=${encodeURIComponent(companyId)}&name=${encodeURIComponent(file.name)}`;
  const res = await fetch(`${API_BASE_URL}api/documents/upload${query}`, { method: "POST", body: formData, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to upload document (${res.status})`);
  return res.json();
}

export async function fetchDocumentById(documentId: number) {
  const res = await fetch(`${API_BASE_URL}api/documents/${documentId}`);
  if (!res.ok) throw new Error(`Failed to fetch document (${res.status})`);
  return res.json();
}

export async function downloadDocumentById(documentId: number) {
  const token = await AsyncStorage.getItem("access_token");
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
  const token = await AsyncStorage.getItem("access_token");
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
  const res = await fetch(`${API_BASE_URL}api/approval-data/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(approvalData) });
  if (!res.ok) throw new Error(`Failed to create approval data (${res.status})`);
  return res.json();
}

export async function fetchApprovalDataByWorkflow(workflowDataId: number) {
  const res = await fetch(`${API_BASE_URL}api/approval-data/filter?workflow_data_id=${workflowDataId}`);
  return res.ok ? res.json() : [];
}

export async function updateApprovalData(data: { id: number; status: string; time: string; [key: string]: any }) {
  if (!data.id) throw new Error("ApprovalData ID is required");
  const res = await fetch(`${API_BASE_URL}api/approval-data/${data.id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text() || "Failed to update approval data");
  return res.json();
}

// -------------------- Security --------------------
export async function confirmSecurity(permitId: number) {
  if (!permitId) throw new Error("Permit ID is required");
  const res = await fetch(`${API_BASE_URL}api/applications/${permitId}/confirm-security`, { method: "POST", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    let message = "";
    try {
      const data = await res.json();
      message = data.message || data.detail || "";
    } catch {
      message = await res.text();
    }
    throw new Error(message || "Failed to confirm security");
  }
  return res.json();
}

// -------------------- Utility: Paginated Fetch --------------------
export async function fetchPaginatedData<T = any>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = `${API_BASE_URL}${endpoint}?page=1&page_size=100`;
  while (nextUrl) {
    try {
      const res = await fetch(nextUrl);
      if (!res.ok) break;
      const data: any = await res.json();
      if (Array.isArray(data)) { results.push(...data); break; }
      if (data && Array.isArray(data.results)) { results.push(...data.results); nextUrl = data.next ? (data.next.startsWith("http") ? data.next : `${API_BASE_URL}${data.next}`) : null; }
      else break;
    } catch { break; }
  }
  return results;
}