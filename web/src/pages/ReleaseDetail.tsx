import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StreamingLinks } from "../components/StreamingLinks";
import { toTrack } from "../components/ReleaseCard";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import { usePlayer } from "../player/PlayerContext";
import type { Release } from "../types";

function toEmbed(url: string): string {
  const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export function ReleaseDetail() {
  const { slug } = useParams();
  const [release, setRelease] = useState<Release | null>(null);
  const [missing, setMissing] = useState(false);
  const player = usePlayer();

  useEffect(() => {
    if (!slug) return;
    setRelease(null); setMissing(false);
    api.get<Release>(`/api/releases/${slug}`).then(setRelease).catch(() => setMissing(true));
  }, [slug]);

  useMeta(release ? `${release.title} — MXK` : "MXK", release?.description || undefined);

  if (missing) return <div className="mx-auto max-w-6xl px-6 pt-40 text-center text-fog">Release not found. <Link to="/music" className="text-chrome underline">Back to music</Link></div>;
  if (!release) return <div className="pt-40 text-center text-fog">Loading…</div>;

  const embed = release.embedUrl || release.youtube;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:pt-32">
      <Link to="/music" className="text-sm text-fog transition hover:text-chrome">← Music</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-ink-3 shadow-2xl">
          {mediaUrl(release.artwork)
            ? <img src={mediaUrl(release.artwork)} alt={release.title} className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center text-fog">MXK</div>}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">{release.type.replace("_", " ")}</p>
          <h1 className="display mt-2 text-5xl text-chrome sm:text-6xl">{release.title}</h1>
          {release.featuredArtists && <p className="mt-2 text-lg text-fog">{release.featuredArtists}</p>}
          <p className="mt-1 text-sm text-fog">{formatDate(release.releaseDate)}</p>
          {release.description && <p className="mt-5 max-w-xl leading-relaxed text-fog">{release.description}</p>}
          <div className="mt-7 space-y-4">
            {release.previewUrl && (
              <button onClick={() => player.play([toTrack(release)])}
                className="rounded-full bg-chrome px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-white">▶ Play preview</button>
            )}
            <StreamingLinks release={release} />
          </div>
        </div>
      </div>

      {embed && (
        <div className="mt-14">
          <h2 className="display text-3xl text-chrome">Watch</h2>
          <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-line">
            <iframe src={toEmbed(embed)} title={release.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
