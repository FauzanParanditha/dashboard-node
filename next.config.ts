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
  env: {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    HMAC_KEY: process.env.HMAC_KEY,
  },
};

export default nextConfig;
