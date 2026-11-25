import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const storageUrl = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: storageUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: storageUrl.hostname,
      port: storageUrl.port,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // Invalid configuration is reported by the server client; do not allow arbitrary image hosts.
  }
}

const nextConfig: NextConfig = { images: { remotePatterns } };

export default nextConfig;
