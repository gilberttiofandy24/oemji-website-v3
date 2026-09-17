import { NextResponse } from "next/server";
import { ApiError, getCheckoutStatus } from "@/lib/backend";

export async function GET(_req: Request, { params }: { params: Promise<{ refId: string }> }) {
  const { refId } = await params;

  try {
    const result = await getCheckoutStatus(refId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal memuat status pesanan" }, { status: 500 });
  }
}
