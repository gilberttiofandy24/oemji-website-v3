import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "oemji_session";
const LOGGED_IN_COOKIE = "oemji_logged_in";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function setSessionCookie(token: string) {
  const store = await cookies();
  const options = {
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
  store.set(SESSION_COOKIE, token, { ...options, httpOnly: true });
  store.set(LOGGED_IN_COOKIE, "1", { ...options, httpOnly: false });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(LOGGED_IN_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
