/** Client-safe demo mode flag (staging Vercel only) */
export function isPublicDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export const DEMO_LOGIN = {
  email: "demo@virlux.com",
  password: "demo12345",
} as const;

export const DEMO_APPROVER = {
  email: "approver@virlux.demo",
  password: "demo12345",
} as const;
