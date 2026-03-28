import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage = pathname === "/" || pathname === "/login";
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/connection");

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/profile/:path*", "/connection/:path*"],
};
