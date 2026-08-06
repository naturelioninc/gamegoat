import { NextResponse } from "next/server";
import { getExchange } from "@/app/kris-kringle/plan/actions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const exchange = await getExchange(id);
  if (!exchange) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(exchange);
}
