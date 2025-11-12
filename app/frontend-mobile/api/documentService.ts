import { apiFetch } from "./client";

export async function uploadDocument(file: any, companyId: number = 1) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.mimeType || "application/octet-stream",
    name: file.name,
  } as any);

  const query = `?company_id=${encodeURIComponent(companyId)}&name=${encodeURIComponent(file.name)}`;

  return apiFetch(`api/documents/upload${query}`, {
    method: "POST",
    body: formData,
  });
}