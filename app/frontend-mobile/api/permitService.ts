import { apiFetch } from "./client";

export const fetchPermitTypes = () =>
  apiFetch("api/permit-types/");