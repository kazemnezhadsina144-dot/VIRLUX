const API_INTERNAL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

/** Browser uses the app /api proxy; SSR calls the API URL directly */
export function apiBase(): string {
  if (typeof window !== "undefined") return "";
  return API_INTERNAL;
}

export type ApiError = { error: string; code?: string };

export class ApiRequestError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

export function setSession(_accessToken: string, _refreshToken: string) {
  // Tokens live in httpOnly cookies set by API; keep for backward compat during migration
  if (typeof window === "undefined") return;
  localStorage.removeItem("virlux_access");
  localStorage.removeItem("virlux_refresh");
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("virlux_access");
  localStorage.removeItem("virlux_refresh");
}

export function hasSession(): boolean {
  // httpOnly cookies are not readable in JS — middleware + /api/auth/me are authoritative
  return false;
}

async function refreshAccess(): Promise<boolean> {
  const res = await fetch(`${apiBase()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });
  return res.ok;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const run = async () =>
    fetch(`${apiBase()}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

  let res = await run();

  if (res.status === 401 && path !== "/api/auth/refresh" && path !== "/api/auth/login") {
    const ok = await refreshAccess();
    if (ok) res = await run();
  }

  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new ApiRequestError(err.error ?? "Request failed", err.code);
  }
  return data as T;
}

export async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  clearSession();
}

export { API_INTERNAL as API };
