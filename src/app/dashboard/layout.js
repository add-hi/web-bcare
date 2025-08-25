// src/app/dashboard/layout.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useIdleTimer } from 'react-idle-timer';
import useUser from "@/hooks/useUser";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const { user, status } = useAuthStore();

    const [remaining, setRemaining] = useState(0)
    const { logout } = useUser();

    const onIdle = () => {
        logout();
    }

    const { getRemainingTime } = useIdleTimer({
        onIdle,
        timeout: 1 * 60 * 1000,
        throttle: 500
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(Math.ceil(getRemainingTime() / 1000))
        }, 500)

        return () => {
            clearInterval(interval)
        }
    })

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

    return (
        <div className="min-h-screen bg-gray-100">
            <p>{remaining} seconds remaining</p>
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
