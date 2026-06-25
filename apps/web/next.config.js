/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/logger"],
  // winston is Node-only; keep it external so Next never bundles it.
  serverExternalPackages: ["winston"],
};

export default nextConfig;
