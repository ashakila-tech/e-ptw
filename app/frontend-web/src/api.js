import axios from "axios";

// Base API URL (adjust if FastAPI runs on another port or server)
const API = axios.create({
  baseURL: "http://localhost:8000", // change to your backend URL
});

// Example endpoints:
export const loginUser = (data) => API.post("/auth/login", data);
export const signupUser = (data) => API.post("/auth/signup", data);

export const getCompanies = () => API.get("/companies");
export const createCompany = (data) => API.post("/companies", data);

export const getPermitTypes = () => API.get("/permit-types");
export const createPermitType = (data) => API.post("/permit-types", data);

export const getWorkflows = () => API.get("/workflows");
export const createWorkflow = (data) => API.post("/workflows", data);

export const getApprovals = () => API.get("/approvals");
export const createApproval = (data) => API.post("/approvals", data);
