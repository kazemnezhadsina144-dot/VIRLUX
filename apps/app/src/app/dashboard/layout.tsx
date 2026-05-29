"use client";

import { AuthProvider } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-virlux-bg">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-app-gradient p-6 md:p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
