import Constants from "expo-constants";
import { PermitStatus } from "@/constants/Status";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

// -------------------- Auth --------------------
export async function login(email: string, password: string) {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${API_BASE_URL}auth/login`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }

  const data = await res.json();
  const token = data.access_token;

  await AsyncStorage.setItem("access_token", token);
  return token;
}

export async function registerUser(payload: {
  company_id: number;
  name: string;
  email: string;
  user_type: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE_URL}auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Registration failed: ${err}`);
  }

  return res.json();
}

export async function registerApplicant(payload: {
  company_id: number;
  name: string;
  email: string;
  user_type: number;
  password: string;
}) {
  const res = await fetch(`${API_BASE_URL}auth/register-applicant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to register applicant: ${err}`);
  }

  return res.json();
}

export async function getCurrentUser() {
  const token = await AsyncStorage.getItem("access_token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE_URL}auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch user: ${err}`);
  }

  return res.json();
}

// -------------------- Permit Types --------------------
export async function fetchPermitTypes() {
  const res = await fetch(`${API_BASE_URL}api/permit-types/`);
  if (!res.ok) throw new Error("Failed to fetch permit types");
  return res.json();
}

// -------------------- Locations --------------------
export async function fetchLocations() {
  const res = await fetch(`${API_BASE_URL}api/locations/`);
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

// -------------------- Users & Job Assigners --------------------
export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}api/users/`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchUsersByGroupName(groupName: string) {
  const res = await fetch(`${API_BASE_URL}api/users/by-group-name/${groupName}`);
  if (!res.ok) throw new Error(`Failed to fetch users for group ${groupName}`);
  return await res.json();
}

export async function fetchUsersByGroupId(groupId: number) {
  const res = await fetch(`${API_BASE_URL}api/users/by-group-id/${groupId}`);
  if (!res.ok) throw new Error(`Failed to fetch users for group ID ${groupId}`);
  return await res.json();
}

export async function fetchUserGroups() {
  const res = await fetch(`${API_BASE_URL}api/user-groups/`);
  if (!res.ok) throw new Error("Failed to fetch user groups");
  return res.json();
}

export async function fetchJobAssigners() {
  try {
    const usersRes = await fetch(`${API_BASE_URL}api/users`);
    const groupsRes = await fetch(`${API_BASE_URL}api/groups`);
    const userGroupsRes = await fetch(`${API_BASE_URL}api/user-groups`);

    if (!usersRes.ok) console.error("Users fetch failed:", usersRes.status);
    if (!groupsRes.ok) console.error("Groups fetch failed:", groupsRes.status);
    if (!userGroupsRes.ok) console.error("UserGroups fetch failed:", userGroupsRes.status);

    if (!usersRes.ok || !groupsRes.ok || !userGroupsRes.ok) {
      throw new Error("Failed to fetch assigners data");
    }

    const users = await usersRes.json();
    const groups = await groupsRes.json();
    const userGroups = await userGroupsRes.json();

    const managerGroupId = 3;
    const managerUserIds = userGroups
      .filter((ug: any) => ug.group_id === managerGroupId)
      .map((ug: any) => ug.user_id);

    const managers = users.filter((u: any) => managerUserIds.includes(u.id));

    return managers.map((u: any) => ({ label: u.name, value: u.id }));
  } catch (err) {
    console.error("Error fetching job assigners:", err);
    return [];
  }
}

export async function fetchPermitOfficersByPermitType(permitTypeId: number) {
  const res = await fetch(`${API_BASE_URL}api/permit-officers/filter?permit_type_id=${permitTypeId}`);
  if (!res.ok) throw new Error(`Failed to fetch permit officers: ${res.statusText}`);
  return res.json();
};

export async function fetchLocationManagersByLocation(locationId: number) {
  const res = await fetch(`${API_BASE_URL}api/location-managers/filter?location_id=${locationId}`);
  if (!res.ok) throw new Error(`Failed to fetch location managers: ${res.statusText}`);
  return res.json();
};

// -------------------- Document Upload --------------------
export async function uploadDocument(file: any, companyId: number = 1) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.mimeType || "application/octet-stream",
    name: file.name,
  } as any);

  // Attach company_id and name as query parameters instead of form data
  const query = `?company_id=${encodeURIComponent(companyId)}&name=${encodeURIComponent(file.name)}`;

  const res = await fetch(`${API_BASE_URL}api/documents/upload${query}`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Upload failed:", res.status, text);
    throw new Error(`Failed to upload document (${res.status})`);
  }

  return res.json();
}


// -------------------- Workflow --------------------
export async function createWorkflow(name: string, company_id: number, permit_type_id: number) {
  const res = await fetch(`${API_BASE_URL}api/workflows/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, company_id, permit_type_id }),
  });
  if (!res.ok) throw new Error("Failed to create workflow");
  return res.json();
}

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

// -------------------- Applications --------------------
export async function saveApplication(id: number | null, payload: any, isUpdate: boolean) {
  const url = id && isUpdate ? `${API_BASE_URL}api/applications/${id}` : `${API_BASE_URL}api/applications/`;
  const method = id && isUpdate ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("Application response status:", res.status);
  console.log("Application response text:", text);

  if (!res.ok) throw new Error("Failed to save application");
  return JSON.parse(text);
}

// -------------------- Approvals --------------------

// Create Approval
export async function createApproval(approval: {
  company_id: number;
  workflow_id: number;
  user_group_id?: number | null;
  user_id: number;
  name: string;
  role_name: string;
  level: number;
}) {
  const res = await fetch(`${API_BASE_URL}api/approvals/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approval),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Approval creation failed:", res.status, text);
    throw new Error(`Failed to create approval (${res.status})`);
  }

  return JSON.parse(text);
}

// Create Approval Data
export async function createApprovalData(approvalData: {
  company_id: number;
  approval_id: number;
  document_id: number;
  workflow_data_id: number;
  status: PermitStatus.PENDING | PermitStatus.APPROVED | PermitStatus.REJECTED | PermitStatus.WAITING;
  approver_name: string;
  time: string;
  role_name: string;
  level: number;
}) {
  const res = await fetch(`${API_BASE_URL}api/approval-data/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approvalData),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("ApprovalData creation failed:", res.status, text);
    throw new Error(`Failed to create approval data (${res.status})`);
  }

  return JSON.parse(text);
}
