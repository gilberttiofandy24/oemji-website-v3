import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const result = await validatePromoCode(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Kode promo tidak valid" }, { status: 400 });
  }
}
