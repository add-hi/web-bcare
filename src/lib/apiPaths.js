// src/lib/apiPaths.js
// Optional prefix so you can flip between `/` and `/v1` without code changes.
const prefix = (process.env.NEXT_PUBLIC_API_PREFIX || "").replace(/\/$/, "");
const p = (s) => `${prefix}${s}`;

const apiPaths = {
  auth: {
    loginEmployee: p("/auth/login/employee"),
    me: p("/auth/me"),
    refresh: p("/auth/refresh"),
    logout: p("/auth/logout"),
  },
  // Add other domains (tickets, etc.) here later.
};

export default apiPaths;
