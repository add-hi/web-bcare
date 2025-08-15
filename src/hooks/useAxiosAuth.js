// src/hooks/useAxiosAuth.js
'use client';
import { useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore, ensureBearer } from '@/store/auth';
import { apiBase } from '@/lib/httpClient';

/**
 * Returns a memoized axios instance that always sends the latest Authorization header.
 * Use this for calls that require auth (after login).
 */
export default function useAxiosAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const client = useMemo(() => {
    return axios.create({
      baseURL: apiBase,
      timeout: 15000,
      withCredentials: false,
    });
  }, []);

  useEffect(() => {
    const reqId = client.interceptors.request.use((config) => {
      const token = accessToken ? ensureBearer(accessToken) : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = token;
      }
      return config;
    });

    return () => {
      client.interceptors.request.eject(reqId);
    };
  }, [client, accessToken]);

  return client;
}
