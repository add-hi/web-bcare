"use client";

import useAxiosAuth from "@/hooks/useAxiosAuth";
import httpClient from "@/lib/httpClient";
import { useEffect } from "react";

/** Dipasang sekali di root layout untuk memasang interceptor Axios secara global */
export default function ClientInit() {
    useEffect(() => {
        console.log("[ClientInit] interceptor mounted");
        console.log("[ClientInit] httpClient baseURL =", httpClient.defaults.baseURL);
        try {
            const raw = localStorage.getItem("auth");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.state) {
                delete parsed.state.accessToken;
                delete parsed.state.refreshToken;
                delete parsed.state.tokenType;
                localStorage.setItem("auth", JSON.stringify(parsed));
            }
        } catch { }
    }, []);

    useAxiosAuth();
    return null;
}
