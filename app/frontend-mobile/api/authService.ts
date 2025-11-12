import { apiFetch } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function login(email: string, password: string) {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const data = await apiFetch<{ access_token: string }>("auth/login", {
    method: "POST",
    body: formData,
  });

  await AsyncStorage.setItem("access_token", data.access_token);
  return data.access_token;
}

export function registerUser(payload: {
  company_id: number;
  name: string;
  email: string;
  user_type: string;
  password: string;
}) {
  return apiFetch("auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return apiFetch("auth/me", {}, true);
}