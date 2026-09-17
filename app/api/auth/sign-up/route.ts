import { NextRequest, NextResponse } from "next/server";
import { ApiError, signUpUser } from "@/lib/backend";
import { setSessionCookie } from "@/lib/session";

function toE164(phone: string) {
  if (phone.startsWith("+")) return phone;
  if (phone.startsWith("0")) return `+62${phone.slice(1)}`;
  return `+${phone}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const result = await signUpUser({
      email: body.email,
      password: body.password,
      username: body.username,
      phone: toE164(body.phone),
      is_reseller: false,
    });
    await setSessionCookie(result.data.token);
    return NextResponse.json({ message: result.message, account: result.data.account });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal mendaftar" }, { status: 500 });
  }
}
