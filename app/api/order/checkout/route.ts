import { NextRequest, NextResponse } from "next/server";
import { ApiError, checkout } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  const body = await req.json();
  try {
    const result = await checkout(token, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal checkout" }, { status: 500 });
  }
}
