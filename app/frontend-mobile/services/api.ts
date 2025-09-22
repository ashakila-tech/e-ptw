import { API_BASE_URL } from "@env";

export async function fetchPermitTypes() {
  const res = await fetch(`${API_BASE_URL}api/permit-types/`);
  return res.json();
}

export async function fetchLocations() {
  const res = await fetch(`${API_BASE_URL}api/locations/`);
  return res.json();
}

export async function uploadDocument(file: any) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/octet-stream",
  } as any);

  const res = await fetch(`${API_BASE_URL}api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json();
}

export async function createWorkflow(name: string, companyId: number, permitTypeId: number) {
  const res = await fetch(`${API_BASE_URL}api/workflows/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      company_id: companyId,
      permit_type_id: permitTypeId,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create workflow (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function createWorkflowData(payload: any) {
  const res = await fetch(`${API_BASE_URL}api/workflow-data/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create workflow-data (${res.status})`);
  return res.json();
}

export async function updateWorkflowData(id: number, payload: any) {
  const res = await fetch(`${API_BASE_URL}api/workflow-data/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update workflow-data (${res.status})`);
  return res.json();
}

export async function saveApplication(
  id: number | null,
  payload: any,
  isEditing: boolean
) {
  const url = isEditing
    ? `${API_BASE_URL}api/applications/${id}`
    : `${API_BASE_URL}api/applications/`;

  const method = isEditing ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Failed to save application (${res.status})`);
  return res.json();
}