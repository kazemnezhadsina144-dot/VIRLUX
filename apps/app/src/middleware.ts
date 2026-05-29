import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "virlux_access";
const REFRESH_COOKIE = "virlux_refresh";

export function middleware(request: NextRequest) {
  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value;
  const hasRefresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!hasAccess && !hasRefresh) {
    const login = new URL("/", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
