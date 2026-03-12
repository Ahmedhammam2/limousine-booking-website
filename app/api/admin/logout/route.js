import { clearSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  // Clear admin session and authentication cookies
  await clearSession();
  return NextResponse.json({ success: true });
}
