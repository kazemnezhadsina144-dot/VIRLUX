const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export type ApiError = { error: string; code?: string };

function tokens() {
  if (typeof window === "undefined") return { access: "", refresh: "" };
  return {
    access: localStorage.getItem("virlux_access") ?? "",
    refresh: localStorage.getItem("virlux_refresh") ?? "",
  };
}

export function setSession(accessToken: string, refreshToken: string) {
  localStorage.setItem("virlux_access", accessToken);
  localStorage.setItem("virlux_refresh", refreshToken);
}

export function clearSession() {
  localStorage.removeItem("virlux_access");
  localStorage.removeItem("virlux_refresh");
}

export function hasSession(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("virlux_access");
}

async function refreshAccess(): Promise<string | null> {
  const { refresh } = tokens();
  if (!refresh) return null;
  const res = await fetch(`${API}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setSession(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const run = async (token: string) =>
    fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

  let { access } = tokens();
  let res = await run(access);

  if (res.status === 401 && tokens().refresh) {
    const newToken = await refreshAccess();
    if (newToken) res = await run(newToken);
  }

  const data = await res.json();
  if (!res.ok) throw new Error((data as ApiError).error ?? "Request failed");
  return data as T;
}

export { API };
