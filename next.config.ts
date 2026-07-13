import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { NextConfig } from "next";

// Build-time guard: NEXT_PUBLIC_* are inlined into the client bundle at
// `next build`. If NEXT_PUBLIC_SECRET_KEY is missing, every payment create
// throws before a request is sent and the UI shows only a generic error with
// nothing in the network tab. Fail the production build instead of shipping a
// broken bundle. (Dev server is exempt so local work without the secret still
// runs.)
const REQUIRED_PUBLIC_ENV = ["NEXT_PUBLIC_SECRET_KEY", "NEXT_PUBLIC_CLIENT_API_URL"];

function assertBuildEnv() {
  const missing = REQUIRED_PUBLIC_ENV.filter(
    (name) => !process.env[name] || process.env[name]!.trim() === "",
  );
  if (missing.length > 0) {
    throw new Error(
      `[build] Missing required NEXT_PUBLIC_* env at build time: ${missing.join(", ")}. ` +
        `These are baked into the client bundle by \`next build\`; building without them ` +
        `ships a bundle where payment signing fails silently. Set them (CI build args / .env) and rebuild.`,
    );
  }
}

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
    // frame-ancestors is handled per-route below (payment pages are embeddable),
    // so it is intentionally NOT part of this report-only policy.
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss:",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    const baseHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Keep the dashboard, auth, hosted checkout and docs out of search indexes.
      // Header form covers every response type (HTML, JSON, assets) globally.
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
    ];

    // Anti-clickjacking for everything that is NOT the hosted payment UI.
    const noFraming = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    ];

    return [
      // Hosted payment pages: embedded by arbitrary merchant sites, so framing
      // is intentionally NOT restricted (no X-Frame-Options, no frame-ancestors).
      // Clickjacking risk is limited — orders are signed and funds always go to
      // the order's merchant.
      { source: "/payment", headers: baseHeaders },
      { source: "/payment/:path*", headers: baseHeaders },
      // Everything else (dashboard, auth, root, ...): full lockdown, no framing.
      { source: "/((?!payment).*)", headers: [...baseHeaders, ...noFraming] },
    ];
  },
};

export default (phase: string) => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertBuildEnv();
  }
  return nextConfig;
};
