import { cookies } from "next/headers";

function verifyPassword(inputPassword) {
  return inputPassword === process.env.ADMIN_PASSWORD;
}

async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "admin-session",
    value: "authenticated",
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "lax",
  });
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin-session");
  return sessionCookie?.value === "authenticated";
}

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-session");
}

export { verifyPassword, createSession, isAuthenticated, clearSession };
