import Constants from "expo-constants";

// Platform overrides for Expo Web (Metro bundler)
// We avoid 'import.meta' here to prevent SyntaxError in the browser bundle.

const rawUrl = Constants.expoConfig?.extra?.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? (window as any).API_BASE_URL : '') || '';
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl : (rawUrl ? `${rawUrl}/` : "");

export async function getApiBaseUrl(): Promise<string> {
  if ((globalThis as any).__API_BASE_URL) return (globalThis as any).__API_BASE_URL;
  return API_BASE_URL;
}

export async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('access_token');
  }
  return null;
}

export async function setToken(token: string | null): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token === null) window.localStorage.removeItem('access_token');
    else window.localStorage.setItem('access_token', token);
  }
}

export async function removeToken(): Promise<void> {
  await setToken(null);
}

export function setBaseUrlForRuntime(url: string) {
  (globalThis as any).__API_BASE_URL = url;
}

export async function getApiBaseUrlWithOverride(): Promise<string> {
  return getApiBaseUrl();
}