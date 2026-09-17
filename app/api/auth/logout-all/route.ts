import { NextResponse } from "next/server";
import { logoutAllUser } from "@/lib/backend";
import { clearSessionCookie, getSessionToken } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await logoutAllUser(token).catch(() => null);
  }
  await clearSessionCookie();
  return NextResponse.json({ message: "logged out from all devices" });
}
