import { useEffect, useMemo, useState } from "react";
import { Reveal } from "../components/Reveal";
import { ReleaseCard, toTrack } from "../components/ReleaseCard";
import { api } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import { usePlayer } from "../player/PlayerContext";
import type { Release } from "../types";

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "SINGLE", label: "Singles" },
  { key: "ALBUM", label: "Albums" },
  { key: "REMIX", label: "Remixes" },
  { key: "COLLAB", label: "Collaborations" },
  { key: "ARABIC_HOUSE", label: "Arabic House" },
];

export function Music() {
  useMeta("Music — MXK", "Every MXK release: singles, albums, remixes, collaborations and Arabic House.");
  const [releases, setReleases] = useState<Release[]>([]);
  const [filter, setFilter] = useState("");
  const player = usePlayer();

  useEffect(() => { api.get<Release[]>("/api/releases").then(setReleases).catch(() => {}); }, []);

  const shown = useMemo(() => releases.filter((r) => !filter || r.type === filter), [releases, filter]);
  const playable = shown.filter((r) => r.previewUrl);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 sm:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl text-chrome sm:text-6xl">Music</h1>
        {playable.length > 0 && (
          <button onClick={() => player.play(playable.map(toTrack))}
            className="rounded-full bg-chrome px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-white">▶ Play all</button>
        )}
      </div>

      <div className="no-bar mt-6 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === f.key ? "bg-chrome text-ink" : "border border-line text-fog hover:text-chrome"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-16 text-center text-fog">Nothing here yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((r, i) => <Reveal key={r.id} delay={(i % 4) * 60}><ReleaseCard release={r} /></Reveal>)}
        </div>
      )}
    </div>
  );
}
