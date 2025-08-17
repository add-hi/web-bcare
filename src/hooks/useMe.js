// src/hooks/useMe.js
"use client";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";

/**
 * Ensure user data is present after a hard reload/open-in-new-tab.
 * Uses hydrateFromMe() if available, otherwise falls back to fetchMe().
 */
export default function useMe({ enabled = true } = {}) {
  const { isAuthenticated, user, status, hydrateFromMe, fetchMe } = useAuth();

  useEffect(() => {
    if (!enabled) return;

    // Only attempt when authenticated and user is missing.
    // Skip if we're already loading to avoid double calls.
    if (isAuthenticated && !user && status !== "loading") {
      const run = hydrateFromMe || fetchMe;
      run?.().catch(() => {});
    }
  }, [enabled, isAuthenticated, user, status, hydrateFromMe, fetchMe]);
}
