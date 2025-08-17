"use client";
import axios from "axios";

/** Always resolve to either a full https URL or a rooted path like '/api' */
function normalizeBase(v) {
  if (!v || !v.trim()) return "/api"; // default: same-origin proxy
  const s = v.trim();

  // full URL? keep as-is (minus trailing slash)
  if (/^https?:\/\//i.test(s)) return s.replace(/\/$/, "");

  // relative like 'api' or '/api' -> ensure single leading slash, no trailing slash
  return (s.startsWith("/") ? s : `/${s}`).replace(/\/$/, "");
}

// If NEXT_PUBLIC_API_BASE_URL is not set, this becomes '/api'
export const apiBase = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL);

// Optional: dev debug to confirm the value once on startup
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.log("[httpClient] baseURL =", apiBase);
}

const httpClient = axios.create({
  baseURL: apiBase,
  timeout: 20000,
  withCredentials: false,
});

export default httpClient;
