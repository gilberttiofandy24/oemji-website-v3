import { NextResponse } from "next/server";
import { ApiError, setupTwoFactorUser } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  try {
    const result = await setupTwoFactorUser(token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal memulai setup 2FA" }, { status: 500 });
  }
}
