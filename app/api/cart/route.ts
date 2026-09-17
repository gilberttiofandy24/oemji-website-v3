import { NextRequest, NextResponse } from "next/server";
import { addCartItem, ApiError, clearCart, getCart } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  try {
    const result = await getCart(token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal memuat keranjang" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  const body = await req.json();
  try {
    const result = await addCartItem(token, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal menambah item" }, { status: 500 });
  }
}

export async function DELETE() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  try {
    await clearCart(token);
    return NextResponse.json({ message: "cart cleared" });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal mengosongkan keranjang" }, { status: 500 });
  }
}
