// src/hooks/useAuth.js
'use client';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth';

/** Convenience wrapper around the store */
export default function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const initialize = useAuthStore((s) => s.initialize);
  const error = useAuthStore((s) => s.error);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return useMemo(() => ({
    status,
    user,
    accessToken,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    error,
  }), [status, user, accessToken, isAuthenticated, login, logout, error]);
}
