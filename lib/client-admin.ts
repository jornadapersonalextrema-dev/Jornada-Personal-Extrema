import { createBrowserSupabaseClient } from "./supabase-browser";

export async function getAdminAuthHeaders() {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function buildAdminApiUrl(path: string, legacyToken?: string) {
  if (!legacyToken) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}token=${encodeURIComponent(legacyToken)}`;
}

export async function adminFetch(path: string, legacyToken?: string, init?: RequestInit) {
  const authHeaders = await getAdminAuthHeaders();
  const headers = new Headers(init?.headers);

  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return fetch(buildAdminApiUrl(path, legacyToken), {
    ...init,
    headers,
  });
}
