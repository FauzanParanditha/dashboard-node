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

  // Baseline security headers applied to every response. A full
  // Content-Security-Policy is intentionally omitted here — it needs per-page
  // testing (inline scripts, Quill, payment pages) and is tracked separately.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Restrict framing without enabling a full CSP (low breakage risk).
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
