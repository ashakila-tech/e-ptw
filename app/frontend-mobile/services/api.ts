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

export async function createWorkflow(name: string) {
  const res = await fetch(`${API_BASE_URL}api/workflows/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
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