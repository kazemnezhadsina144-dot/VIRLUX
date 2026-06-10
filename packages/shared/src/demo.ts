/** Client-safe demo mode flag (staging Vercel only) */
export function isPublicDemoMode(): boolean {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.NEXT_PUBLIC_DEMO_MODE === "true";
}

/** Demo account emails — passwords live in DEMO_SEED_PASSWORD (server) / E2E_DEMO_PASSWORD (CI), never in git. */
export const DEMO_LOGIN_EMAIL = "demo@virlux.com" as const;
export const DEMO_APPROVER_EMAIL = "approver@virlux.demo" as const;

/** @deprecated Use DEMO_LOGIN_EMAIL — password is not shipped in client bundles. */
export const DEMO_LOGIN = { email: DEMO_LOGIN_EMAIL, password: "" } as const;

/** @deprecated Use DEMO_APPROVER_EMAIL */
export const DEMO_APPROVER = { email: DEMO_APPROVER_EMAIL, password: "" } as const;
