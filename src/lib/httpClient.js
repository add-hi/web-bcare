// src/lib/httpClient.js
"use client";
import axios from "axios";

/**
 * Normalize the base to either a full http(s) URL or a rooted path (/api).
 * Strip a trailing slash; we’ll add /v1 ourselves.
 */
function normalizeBase(v) {
  const fallback = "/api";
  if (!v || !v.trim()) return fallback;
  const s = v.trim();

  // If it's an absolute URL, keep protocol/host and trim trailing slash.
  if (/^https?:\/\//i.test(s)) return s.replace(/\/+$/, "");

  // Otherwise ensure a single leading slash and trim trailing slash.
  return (s.startsWith("/") ? s : `/${s}`).replace(/\/+$/, "");
}

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const base = normalizeBase(rawBase);

// If base already ends with /v1 (case-insensitive), keep it; else append /v1
const apiBase = /\/v1$/i.test(base) ? base : `${base}/v1`;

// Helpful one-time debug
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[httpClient] baseURL =", apiBase);
}

const httpClient = axios.create({
  baseURL: apiBase, // e.g. "/api/v1" (with your Next.js rewrite) or "https://host/v1"
  timeout: 15000,
  withCredentials: false,
});

export default httpClient;
export { apiBase };
