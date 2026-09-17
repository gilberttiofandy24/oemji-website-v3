import { NextRequest, NextResponse } from "next/server";
import { ApiError, getOrderHistory } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  const page = Number(req.nextUrl.searchParams.get("page") ?? "1") || 1;

  try {
    const result = await getOrderHistory(token, page);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal memuat riwayat pesanan" }, { status: 500 });
  }
}
