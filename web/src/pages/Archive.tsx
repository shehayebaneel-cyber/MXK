import { useEffect, useMemo, useState } from "react";
import { Reveal } from "../components/Reveal";
import { api, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { ArchiveItem } from "../types";

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "LIVE", label: "Live" },
  { key: "STUDIO", label: "Studio" },
  { key: "BTS", label: "Behind The Scenes" },
];

export function Archive() {
  useMeta("Archive — MXK", "Photos and video from MXK's live shows, studio sessions and behind the scenes.");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<ArchiveItem | null>(null);

  useEffect(() => {
    api
      .get<ArchiveItem[]>("/api/archive")
      .then(setItems)
      .catch(() => {});
  }, []);
  const shown = useMemo(() => items.filter((i) => !filter || i.category === filter), [items, filter]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:pt-32">
      <h1 className="display text-chrome text-5xl sm:text-6xl">Archive</h1>
      <div className="no-bar mt-6 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === f.key ? "bg-chrome text-ink" : "border-line text-fog hover:text-chrome border"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-fog mt-16 text-center">No media here yet.</p>
      ) : (
        <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {shown.map((i) => (
            <Reveal key={i.id}>
              <button onClick={() => setView(i)} className="border-line bg-ink-3 block w-full overflow-hidden rounded-xl border">
                <img src={mediaUrl(i.thumbnail || i.url)} alt={i.caption} loading="lazy" className="w-full object-cover transition hover:scale-[1.03]" />
                {i.type === "VIDEO" && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl">▶</span>}
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {view && (
        <div className="bg-ink/95 fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setView(null)}>
          {view.type === "VIDEO" ? (
            <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl" onClick={(e) => e.stopPropagation()}>
              <iframe src={view.url} title={view.caption} className="h-full w-full" allowFullScreen />
            </div>
          ) : (
            <img src={mediaUrl(view.url)} alt={view.caption} className="max-h-[92vh] max-w-full rounded-lg object-contain" />
          )}
          <button className="text-chrome absolute right-5 top-5 text-2xl">✕</button>
        </div>
      )}
    </div>
  );
}
