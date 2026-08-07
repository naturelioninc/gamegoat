import { NextResponse } from "next/server";
import { getExchange, getParticipantExchange } from "@/app/kris-kringle/plan/actions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("token");
  if (token) {
    const view = await getParticipantExchange(id, token);
    if (!view) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(view);
  }
  const exchange = await getExchange(id);
  if (!exchange) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(exchange);
}
