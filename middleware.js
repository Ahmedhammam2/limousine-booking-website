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

    // 👇 1. Create a response object for successful validation
    const response = NextResponse.next();

    // 👇 2. Append anti-cache headers to the response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (err) {
    // If the token is invalid/expired, remove the cookie and bounce them to login
    const loginRedirect = NextResponse.redirect(new URL("/admin/login", request.url));
    loginRedirect.cookies.delete("admin-session");
    return loginRedirect;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};