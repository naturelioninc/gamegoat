import { notFound } from "next/navigation";
import { getExchange } from "../actions";
import { ExchangeDashboard } from "./ExchangeDashboard";

export default async function ExchangePlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exchange = await getExchange(id);
  if (!exchange) notFound();
  return <ExchangeDashboard exchange={exchange} />;
}
