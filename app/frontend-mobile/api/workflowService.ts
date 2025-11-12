import { apiFetch } from "./client";
import { fetchPaginatedData } from "@/utils/pagination";

export const createWorkflow = (payload: {
  name: string;
  company_id: number;
  permit_type_id: number;
}) =>
  apiFetch("api/workflows/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const createWorkflowData = (payload: any) =>
  apiFetch("api/workflow-data/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const updateWorkflowData = (id: number, payload: any) =>
  apiFetch(`api/workflow-data/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const fetchAllWorkflowData = () =>
  fetchPaginatedData("api/workflow-data/");