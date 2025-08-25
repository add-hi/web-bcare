// IdleGuard.jsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useIdle from "@/hooks/useIdle";
import useUser from "@/hooks/useUser";

export default function IdleGuard() {
    const router = useRouter();
    const { logout } = useUser();

    const { isIdle } = useIdle({
        timeout: 2 * 60_000,      // ⬅️ 2 menit
        considerHiddenIdle: true, // tab disembunyikan = idle
        syncAcrossTabs: true,     // sinkron antar tab
    });

    useEffect(() => {
        if (isIdle) {
            logout();
        }
    }, [isIdle, logout, router]);

    return null;
}
