// src/app/dashboard/layout.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const { user, status } = useAuthStore();

    useEffect(() => {
        // Jika belum login, lempar ke /auth/login
        if (!user) {
            router.replace("/login");
        }
    }, [user, router]);

    // Saat belum ada user (mis. sebelum rehydration/cek store selesai), hentikan render
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-sm text-gray-500">
                    {status === "authenticating" || status === "loading"
                        ? "Checking authentication..."
                        : "Redirecting to login..."}
                </div>
            </div>
        );
    }

    // Sudah login → render dashboard
    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <div className="pt-20">
                <Sidebar />
                <main className="ml-64 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
