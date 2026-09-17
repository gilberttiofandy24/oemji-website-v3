import { NextRequest, NextResponse } from "next/server";
import { validatePublicOrder } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const result = await validatePublicOrder(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Gagal memvalidasi akun" }, { status: 400 });
  }
}
