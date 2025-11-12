import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

async function getToken() {
  return AsyncStorage.getItem("access_token");
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  authorized = false
): Promise<T> {
  const baseHeaders: Record<string, string> = { Accept: "application/json" };

  const optionHeaders: Record<string, string> = {};
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => (optionHeaders[key] = value));
  } else if (Array.isArray(options.headers)) {
    for (const [key, value] of options.headers) optionHeaders[key] = value;
  } else if (options.headers) {
    Object.assign(optionHeaders, options.headers);
  }

  // Merge
  const headers: Record<string, string> = {
    ...baseHeaders,
    ...optionHeaders,
  };

  // Add auth token if needed
  if (authorized) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${text || res.statusText}`);
  }

  try {
    return await res.json();
  } catch {
    return {} as T;
  }
}