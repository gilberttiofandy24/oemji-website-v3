import { NextRequest, NextResponse } from "next/server";
import { ApiError, disableTwoFactorUser } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  const body = await req.json();
  try {
    await disableTwoFactorUser(token, { password: body.password, code: body.code });
    return NextResponse.json({ message: "Two-factor authentication dinonaktifkan" });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal menonaktifkan 2FA" }, { status: 500 });
  }
}
