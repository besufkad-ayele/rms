import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("rms_session_user");

  // Protect Admin Portal Routes
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie || !sessionCookie.value) {
      const url = new URL("/rms-login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect Staff Terminal Routes
  if (pathname.startsWith("/staff") && !pathname.startsWith("/staff-login")) {
    if (!sessionCookie || !sessionCookie.value) {
      const url = new URL("/staff-login", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Protect Chef KDS Routes
  if (pathname.startsWith("/chef")) {
    if (!sessionCookie || !sessionCookie.value) {
      const url = new URL("/staff-login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/chef/:path*"],
};
