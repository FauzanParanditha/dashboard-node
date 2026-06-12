import type { GetServerSidePropsContext } from "next";
import { decryptData } from "@/utils/encryption";

// Only http(s) origins (scheme + host [+ port]) — no paths/wildcards.
const ORIGIN_RE = /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/;

/**
 * Per-order CSP frame-ancestors for the hosted payment pages.
 *
 * The merchant's allowed iframe origins are embedded (tamper-proof) inside the
 * encrypted `?q=` payload as `frameOrigins`. We decrypt it server-side and emit
 * `frame-ancestors 'self' <merchant origins>` so ONLY that merchant's site can
 * frame this specific order. If `q` is missing/invalid or no origins are
 * registered, we fall back to `'self'` (no external framing) — fail closed.
 *
 * Used as the pages' getServerSideProps. decryptData runs server-side only and
 * is stripped from the client bundle by Next (gSSP-only import).
 */
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const ancestors = ["'self'"];

  try {
    const raw = ctx.query?.q;
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (token) {
      const data = decryptData(decodeURIComponent(token)) as {
        frameOrigins?: unknown;
      };
      const origins = Array.isArray(data?.frameOrigins) ? data.frameOrigins : [];
      for (const origin of origins) {
        const value = typeof origin === "string" ? origin.trim() : "";
        if (ORIGIN_RE.test(value)) ancestors.push(value);
      }
    }
  } catch {
    // invalid/missing q → keep 'self' only
  }

  ctx.res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors ${ancestors.join(" ")}`,
  );

  return { props: {} };
}
