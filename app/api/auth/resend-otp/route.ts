import { NextResponse } from "next/server";
import { ApiError, resendSignUpOtp } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  try {
    const result = await resendSignUpOtp(token);
    return NextResponse.json({ message: result.message });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal mengirim ulang kode" }, { status: 500 });
  }
}
