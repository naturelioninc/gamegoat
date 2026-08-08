import { OpenLauncher } from "./OpenLauncher";

export const metadata = { title: "Open xmasGOAT Games", robots: { index: false, follow: false } };

export default async function OpenPage({ searchParams }: { searchParams: Promise<{ target?: string }> }) {
  const requested = (await searchParams).target;
  const target = requested?.startsWith("/") && !requested.startsWith("//") && requested !== "/open" ? requested : "/";
  return <OpenLauncher target={target} />;
}
