import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Simple, fast in-memory cache for tracking API spammers
const ipCache = new Map();

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  /* =======================================================
     1. RATE LIMITING ENGINE (Only runs on /api routes)
     ======================================================= */
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const now = Date.now();

    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 20;     // Limit: Max 20 requests per minute

    const requestTimestamps = ipCache.get(ip) || [];
    // Clear out any timestamps older than 1 minute
    const activeRequests = requestTimestamps.filter((timestamp) => now - timestamp < windowMs);

    if (activeRequests.length >= maxRequests) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log this request timestamp and let them through
    activeRequests.push(now);
    ipCache.set(ip, activeRequests);

    return NextResponse.next();
  }

  /* =======================================================
     2. ADMIN SECURITY & AUTHENTICATION (Runs on /admin routes)
     ======================================================= */
  if (pathname === "/admin/login") {
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

    // Create response object and append anti-cache headers
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (err) {
    // If the token is invalid or expired, clear the session cookie and redirect to login
    const loginRedirect = NextResponse.redirect(new URL("/admin/login", request.url));
    loginRedirect.cookies.delete("admin-session");
    return loginRedirect;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};