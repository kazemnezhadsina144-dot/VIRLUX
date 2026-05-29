"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasSession } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasSession()) router.replace("/");
  }, [router]);

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-virlux-bg">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-app-gradient p-6 md:p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
