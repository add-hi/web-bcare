"use client";
import axios from "axios";

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL &&
    process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "/api";

const apiBase = rawBase.replace(/\/$/, "");

const httpClient = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  withCredentials: false,
});

export default httpClient;
export { apiBase };

