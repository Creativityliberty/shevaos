"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { useRealtimeAlerts } from "@/core/auth/useRealtimeAlerts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Activer les alertes temps réel pour tout le dashboard
  useRealtimeAlerts();

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-gray-50 overflow-hidden">
        <div className="hidden lg:flex shrink-0 border-r border-gray-100">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full no-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
