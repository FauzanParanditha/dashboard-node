import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Server-side route protection for the dashboard.
//
// The API issues the access token as an HttpOnly cookie named "Authorization"
// scoped to the shared parent domain (COOKIE_DOMAIN, e.g. .pandi.id), so this
// middleware — which runs on the dashboard host — can read it even though it
// is set by the API host. JavaScript cannot read it (XSS-safe).
//
// This is a presence check only: full token verification stays on the API
// (every request carries the cookie; a 401 logs the user out client-side).
const AUTH_COOKIE = "Authorization";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
