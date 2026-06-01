"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Me = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  kycStatus: string;
  isPlatformAdmin?: boolean;
  organization?: { id: string; name: string } | null;
  wallet?: { cadBalance: number | string; usdcBalance?: number | string } | null;
};

const AuthContext = createContext<Me | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api<Me>("/api/auth/me").then(setMe).catch(() => setMe(null));
  }, []);

  return <AuthContext.Provider value={me}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function canSend(role?: string) {
  return role === "owner" || role === "admin" || role === "approver";
}

export function canApprove(role?: string) {
  return role === "owner" || role === "admin" || role === "approver";
}

export function canManageTeam(role?: string) {
  return role === "owner" || role === "admin";
}

export function canViewAudit(role?: string) {
  return role === "owner" || role === "admin";
}
