import { NextRequest, NextResponse } from "next/server";
import { ApiError, verifySignUpOtp } from "@/lib/backend";
import { getSessionToken, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Sesi sign-up sudah habis, daftar ulang" }, { status: 401 });
  }

  try {
    const result = await verifySignUpOtp(token, body.otp);
    await setSessionCookie(result.data.token);
    return NextResponse.json({ message: result.message, account: result.data.account });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Verifikasi gagal" }, { status: 500 });
  }
}
