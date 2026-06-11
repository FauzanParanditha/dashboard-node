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

  // Baseline security headers applied to every response.
  async headers() {
    // Full Content-Security-Policy in REPORT-ONLY mode: the browser does NOT
    // block anything, it only logs violations to the console. This lets the
    // team observe what each page actually loads (inline scripts, Quill,
    // payment, fonts) and tighten the policy before switching the header to the
    // enforcing `Content-Security-Policy`. 'unsafe-inline'/'unsafe-eval' are
    // present because the Pages Router emits inline bootstrap scripts; replace
    // them with nonces when moving to enforced mode.
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

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
          // Enforced: only restrict framing (zero breakage risk).
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Observability only — does not block. Tune, then promote to the
          // enforcing header above.
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
