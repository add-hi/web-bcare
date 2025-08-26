"use client";

import useAxiosAuth from "@/hooks/useAxiosAuth";

/** Dipasang sekali di root layout untuk memasang interceptor Axios secara global */
export default function ClientInit() {
    useAxiosAuth();
    return null;      
}
