import { NextRequest, NextResponse } from "next/server";
import { ApiError, verifyTwoFactorUser } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  const body = await req.json();
  try {
    const result = await verifyTwoFactorUser(token, body.code);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal verifikasi kode 2FA" }, { status: 500 });
  }
}
