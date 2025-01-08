import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tokenName } from "@/utils/var";

export function middleware(request: NextRequest) {
  const { origin } = request.nextUrl;
  const token = request.cookies.get(tokenName);
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(`${origin}/auth/login`);
  }
  return NextResponse.next();
}
