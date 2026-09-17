import { NextResponse } from "next/server";
import { ApiError, getMeUser } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  try {
    const result = await getMeUser(token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal memuat akun" }, { status: 500 });
  }
}
