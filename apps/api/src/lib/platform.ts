import { config } from "./config";

export function isPlatformAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return config.platformAdminEmails.includes(email.toLowerCase());
}
