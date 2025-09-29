
// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // uses your EC2 URL
});

// 🔑 Attach token from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example endpoints
export const getCompanies = () => API.get("/api/companies");
export const createCompany = (data) => API.post("/api/companies", data);

export const getPermitTypes = () => API.get("/api/permit-types");
export const createPermitType = (data) => API.post("/api/permit-types", data);

export const getWorkflows = () => API.get("/api/workflows");
export const createWorkflow = (data) => API.post("/api/workflows", data);

export const getApprovals = () => API.get("/api/approvals");
export const createApproval = (data) => API.post("/api/approvals", data);

export default API;
