import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Resolve API URL from Expo Config
const rawUrl = Constants.expoConfig?.extra?.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || "";
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl : (rawUrl ? `${rawUrl}/` : "");

export async function getApiBaseUrl(): Promise<string> {
  return API_BASE_URL;
}

export async function getApiBaseUrlWithOverride(): Promise<string> {
  return getApiBaseUrl();
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem("access_token");
}

export async function setToken(token: string | null): Promise<void> {
  if (token === null) {
    await AsyncStorage.removeItem("access_token");
  } else {
    await AsyncStorage.setItem("access_token", token);
  }
}

export async function removeToken(): Promise<void> {
  await setToken(null);
}

export function setBaseUrlForRuntime(url: string) {
  // Optional: Implement if you need runtime switching in debug menus
  (global as any).__API_BASE_URL = url;
}