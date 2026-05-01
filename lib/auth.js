import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

async function verifyPassword(inputPassword) {
  if (!inputPassword) return false;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return await bcrypt.compare(inputPassword, hash);
}

async function createSession() {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = await new SignJWT({ user: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set({
    name: "admin-session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expires,
    sameSite: "lax",
  });
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin-session");
  if (!sessionCookie) return false;

  try {
    const { payload } = await jwtVerify(sessionCookie.value, key, {
      algorithms: ["HS256"],
    });
    return !!payload;
  } catch (err) {
    return false;
  }
}

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-session");
}

export { verifyPassword, createSession, isAuthenticated, clearSession };
