import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure experimental features are properly configured for Edge Runtime
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Explicitly allow environment variables in Edge Runtime
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
