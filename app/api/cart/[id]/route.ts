import { NextRequest, NextResponse } from "next/server";
import { ApiError, removeCartItem, updateCartItemQuantity } from "@/lib/backend";
import { getSessionToken } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  const body = await req.json();
  try {
    const result = await updateCartItemQuantity(token, id, body.quantity);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal mengubah jumlah" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Belum login" }, { status: 401 });

  try {
    await removeCartItem(token, id);
    return NextResponse.json({ message: "item removed" });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Gagal menghapus item" }, { status: 500 });
  }
}
