import { NextRequest, NextResponse } from "next/server";
import { ApiError, checkout, publicCheckout } from "@/lib/backend";
import { getClientIp } from "@/lib/client-ip";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  const body = await req.json();
  try {
    const result = token
      ? await checkout(token, body)
      : await publicCheckout(body, getClientIp(req));
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal checkout" }, { status: 500 });
  }
}
