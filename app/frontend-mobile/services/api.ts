import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

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

// -------------------- Document Upload --------------------
export async function uploadDocument(file: any) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.mimeType || "application/octet-stream",
    name: file.name,
  } as any);

  const res = await fetch(`${API_BASE_URL}api/documents/upload`, {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!res.ok) throw new Error("Failed to upload document");
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

  if (!res.ok) throw new Error("Failed to save application");
  return res.json();
}

// -------------------- Approvals --------------------
export async function createApproval(payload: any) {
  const res = await fetch(`${API_BASE_URL}api/approvals/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create approval");
  return res.json();
}