// src/lib/httpClient.js
// Base Axios client. Token is attached via useAxiosAuth() hook to avoid circular imports.
"use client";
import axios from "axios";

/**
 * Default to the Next.js rewrite proxy (/api) to avoid CORS.
 * You can override with NEXT_PUBLIC_API_BASE_URL (e.g., a full https URL),
 * but doing so re-introduces CORS unless that origin sends proper headers.
 */
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL &&
  process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "/api";

const apiBase = rawBase.replace(/\/$/, "");

/** Plain client — no auth header here */
const httpClient = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  withCredentials: false, // keep false; you're using bearer tokens, not cookies
});

export default httpClient;
export { apiBase };

