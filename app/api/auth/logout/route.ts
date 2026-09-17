import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/backend";
import { clearSessionCookie, getSessionToken } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await logoutUser(token).catch(() => null);
  }
  await clearSessionCookie();
  return NextResponse.json({ message: "logout successful" });
}
