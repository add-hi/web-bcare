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
  tickets: {
    list: p("/tickets"), // GET   /tickets      ?page=&per_page=&q=...
    detail: (id) => p(`/tickets/${id}`), // GET   /tickets/:id
    create: p("/tickets"), // POST  /tickets
    update: (id) => p(`/tickets/${id}`), // PUT/PATCH /tickets/:id
    remove: (id) => p(`/tickets/${id}`), // DELETE /tickets/:id (if supported)
  },
};

export default apiPaths;
