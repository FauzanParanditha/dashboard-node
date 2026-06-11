import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@ant-design/icons-svg",
    "rc-util",
    "rc-pagination",
    "rc-picker",
    "rc-input",
  ],
  // NOTE: ENCRYPTION_KEY / HMAC_KEY are intentionally NOT exposed here.
  // Exposing them via `env` inlines the secrets into the client bundle.
  // Encryption now happens server-side (src/pages/api/encrypt.ts); the keys
  // are read from process.env at runtime on the server only (encryption.ts).
};

export default nextConfig;
