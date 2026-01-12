// Platform helpers for Vite/web-only usage
// - Resolves API base URL from Vite env or window override
// - Uses localStorage for token storage

/**
 * Return the API base URL. Order of precedence:
 * 1. Vite env VITE_API_BASE_URL
 * 2. window.API_BASE_URL
 */
export const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || (typeof window !== 'undefined' ? (window as any).API_BASE_URL : '') || '';

/**
 * Return the API base URL. Order of precedence:
 * 1. Runtime override via setBaseUrlForRuntime
 * 2. Vite env VITE_API_BASE_URL or REACT_APP_API_BASE_URL
 * 3. window.API_BASE_URL
 * 4. empty string
 */
export async function getApiBaseUrl(): Promise<string> {
  if ((globalThis as any).__API_BASE_URL) return (globalThis as any).__API_BASE_URL;
  // if ((globalThis as any).__API_BASE_URL) return (globalThis as any).__API_BASE_URL;

  // try {
  //   const env = (import.meta as any).env || {};
  //   const url = env.VITE_API_BASE_URL || env.REACT_APP_API_BASE_URL;
  //   if (url) return url;
  // } catch (e) {
  //   // ignore
  // }
  // try {
  //   const env = (import.meta as any).env || {};
  //   const url = env.VITE_API_BASE_URL || env.REACT_APP_API_BASE_URL;
  //   if (url) return url;
  // } catch (e) {
  //   // ignore
  // }

  // if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
  //   return (window as any).API_BASE_URL;
  // }
  // if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
  //   return (window as any).API_BASE_URL;
  // }

  // return '';
  // return '';
  return API_BASE_URL;
}

/**
 * Token helpers that use localStorage on web.
 */
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

// Optional: allow setting a runtime base URL override (useful in tests or when host app wants to inject)
export function setBaseUrlForRuntime(url: string) {
  (globalThis as any).__API_BASE_URL = url;
}

export async function getApiBaseUrlWithOverride(): Promise<string> {
  return getApiBaseUrl();
}
