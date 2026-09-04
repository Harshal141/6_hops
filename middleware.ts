import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage = pathname === "/" || pathname === "/login";
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/connection") || pathname.startsWith("/invite");

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/profile/:path*", "/connection/:path*", "/invite/:path*"],
};
