"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GalleryClient({ code }: { code: string }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.storage
      .from("game-photos")
      .list(code, { limit: 200, sortBy: { column: "created_at", order: "asc" } })
      .then(({ data }) => {
        if (data) {
          setPhotos(
            data
              .filter((f) => f.name !== ".emptyFolderPlaceholder")
              .map(
                (f) =>
                  supabase.storage
                    .from("game-photos")
                    .getPublicUrl(`${code}/${f.name}`).data.publicUrl,
              ),
          );
        }
        setLoading(false);
      });
  }, [code]);

  function shareGallery() {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: "Our Kris Kringle party photos 🎁",
          text: "Check out the photos from our party!",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:py-14">
      <header className="space-y-1">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Kris Kringle · Room {code}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Party photos 📸</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm font-semibold text-slate-400">
          Loading photos…
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-2xl">📷</p>
          <p className="mt-2 font-semibold text-slate-500">No photos yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Photos taken during the game will appear here.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {photos.length} photo{photos.length !== 1 ? "s" : ""} from tonight&apos;s game
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setFullscreen(url)}
                className="aspect-square overflow-hidden rounded-2xl border-2 border-slate-100 transition hover:border-slate-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Party photo" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Share button */}
      <button
        type="button"
        onClick={shareGallery}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl font-black transition ${
          copied
            ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
            : "bg-kringle-spruce text-white"
        }`}
      >
        {copied ? "✓ Link copied!" : "📤 Share this gallery"}
      </button>

      <p className="text-center text-xs text-slate-400">
        This link works forever — photos don&apos;t expire.
      </p>

      {/* Lightbox */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreen}
            alt="Party photo"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setFullscreen(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-2xl leading-none text-white"
          >
            ×
          </button>
          <a
            href={fullscreen}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-5 py-2 text-sm font-bold text-white hover:bg-white/30"
          >
            ⬇ Download
          </a>
        </div>
      )}
    </main>
  );
}
