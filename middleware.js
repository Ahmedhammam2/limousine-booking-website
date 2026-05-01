import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("admin-session");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const secretKey = process.env.JWT_SECRET;
    const key = new TextEncoder().encode(secretKey);
    await jwtVerify(sessionCookie.value, key, {
      algorithms: ["HS256"],
    });
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
