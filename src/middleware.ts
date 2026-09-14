import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      const url = new URL("/rms-login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/staff") && !pathname.startsWith("/staff-login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/staff-login", request.url));
    }
  }

  if (pathname.startsWith("/chef")) {
    if (!session || (session.role !== "cook" && session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.redirect(new URL("/staff-login", request.url));
    }
  }

  if (pathname.startsWith("/cashier")) {
    if (
      !session ||
      (session.role !== "host" && session.role !== "admin" && session.role !== "manager")
    ) {
      const url = new URL("/staff-login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/chef/:path*", "/cashier/:path*"],
};
