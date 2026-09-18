import { NextRequest, NextResponse } from "next/server";
import { ApiError, loginTwoFactorUser } from "@/lib/backend";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const result = await loginTwoFactorUser(body.pending_token, body.code);
    await setSessionCookie(result.data.token);
    return NextResponse.json({ message: result.message, account: result.data.account });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal masuk" }, { status: 500 });
  }
}
