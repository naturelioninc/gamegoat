import { GalleryClient } from "./GalleryClient";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GalleryClient code={code.toUpperCase()} />;
}
