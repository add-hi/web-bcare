// src/hooks/useMe.js
"use client";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";

/**
 * Fetches /auth/me once when authenticated and user is missing.
 * Useful in app shells so Sidebar/Topbar/Profile have data after refresh.
 */
export default function useMe({ enabled = true } = {}) {
  const { isAuthenticated, user, fetchMe, status } = useAuth();

  useEffect(() => {
    if (!enabled) return;
    if (isAuthenticated && !user && status !== "loading") {
      fetchMe().catch(() => {});
    }
  }, [enabled, isAuthenticated, user, status, fetchMe]);
}
