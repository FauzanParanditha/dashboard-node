import { jwtConfig } from "@/utils/var";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*"],
};

export function middleware(request: NextRequest) {
  const { origin } = request.nextUrl;
  const adminToken = request.cookies.get(jwtConfig.admin.accessTokenName);

  if (request.nextUrl.pathname.toLowerCase().startsWith("/dashboard")) {
    if (!adminToken) return NextResponse.redirect(`${origin}/auth/login`);
  }
  return NextResponse.next();
}
