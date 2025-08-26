// next.config.mjs
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Proxy any request under /api/* to your backend to avoid CORS
      { source: "/api/:path*", destination: `${API_BASE}/:path*` },
    ];
  },
};

export default nextConfig;
