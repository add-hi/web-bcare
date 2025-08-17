"use client";

import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TabComponent from "@/components/Tab";
import Topbar from "@/components/Topbar";
import useMe from "@/hooks/useMe";
import useAuth from "@/hooks/useAuth";

export default function DashboardLayout({ children }) {
  const { initialize } = useAuth();

  // Initialize auth store once per mount (restores timers, etc.)
  useEffect(() => {
    initialize?.();
  }, [initialize]);

  // Ensure user data is fetched after hard reload / new tab
  useMe();

  return (
    <div className="min-h-screen bg-gray-100">
      <Topbar />
      <div className="pt-20">
        <Sidebar />
        <main className="ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
