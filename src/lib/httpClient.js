// src/lib/httpClient.js
"use client";
import axios from "axios";

function normalizeBase(v) {
  const fallback = "/api";
  if (!v || !v.trim()) return fallback;
  const s = v.trim();

  if (/^https?:\/\//i.test(s)) return s.replace(/\/+$/, "");

  return (s.startsWith("/") ? s : `/${s}`).replace(/\/+$/, "");
}

const rawBase = process.env.NEXT_PUBLIC_API_URL;
const base = normalizeBase(rawBase);

const apiBase = /\/v1$/i.test(base) ? base : `${base}/v1`;

const httpClient = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  withCredentials: false,
});

// jaga-jaga kalau header di-override di tempat lain
httpClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  if (!("ngrok-skip-browser-warning" in config.headers)) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }
  return config;
});

export default httpClient;
export { apiBase };
