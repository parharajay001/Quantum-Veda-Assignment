import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "access_token";
const AUTH_PAGES = ["/login", "/register"];

// Coarse route gating by cookie presence (the API remains the source of truth for
// validity). Unauthenticated users are sent to /login; authenticated users are
// kept off the auth pages.
export function middleware(request: NextRequest) {
  const hasToken = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!hasToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Run on all routes except Next internals, the auth-log API, and static assets.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
