import { NextRequest, NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = params.get("page");
  const limit = params.get("limit");
  const category = params.get("category");
  const name = params.get("name");

  const result = await getPublicProducts({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    category: category ?? undefined,
    name: name ?? undefined,
  });

  return NextResponse.json(result);
}
