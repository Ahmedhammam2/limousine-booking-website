import { verifyPassword, createSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Parse admin login credentials
  const body = await request.json();
  const { password } = body;
  console.log("LOGIN ATTEMPT:", password, "HASH FROM ENV:", process.env.ADMIN_PASSWORD_HASH);

  // Validate password against server-side secret
  if (await verifyPassword(password)) {
    // Create an authenticated admin session
    await createSession();
    return NextResponse.json({ success: true });
  }

  // Authentication failed
  return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
}
