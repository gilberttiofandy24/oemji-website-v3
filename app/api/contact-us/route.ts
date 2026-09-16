import { NextRequest, NextResponse } from "next/server";
import { submitContactUs } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const result = await submitContactUs(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Gagal mengirim pesan" }, { status: 400 });
  }
}
