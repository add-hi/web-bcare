// src/lib/httpClient.js
// Base Axios client. Token is attached via useAxiosAuth() hook to avoid circular imports.
'use client';
import axios from 'axios';

/** Prefer .env.local: NEXT_PUBLIC_API_BASE_URL=https://YOUR_BASE */
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://4af813bf189d.ngrok-free.app').replace(/\/$/, '');

/** Plain client — no auth header here */
const httpClient = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  withCredentials: false,
});

export default httpClient;
export { apiBase };
