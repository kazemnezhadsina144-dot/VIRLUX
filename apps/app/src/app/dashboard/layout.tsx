"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
