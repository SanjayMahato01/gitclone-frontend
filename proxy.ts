
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "token";

const PROTECTED_ROUTES = ["/dashboard"];

const GUEST_ONLY_ROUTES = ["/login", "/signup"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isLoggedIn = Boolean(token);

  
  if (
    isLoggedIn &&
    GUEST_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  
  if (
    !isLoggedIn &&
    PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set(
      "next",
      `${pathname}${req.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
