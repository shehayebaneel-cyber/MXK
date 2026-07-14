import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { Release } from "../types";

function toEmbed(url: string): string {
  const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/.exec(url);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}

export function ArabicHouse() {
  useMeta("Arabic House — MXK", "MXK's Arabic House world — where dabke meets the dancefloor.");
  const [releases, setReleases] = useState<Release[]>([]);
  useEffect(() => { api.get<Release[]>("/api/releases?type=ARABIC_HOUSE").then(setReleases).catch(() => {}); }, []);

  return (
    <div className="relative">
      <div className="glow absolute inset-0 -z-10 h-[60vh] opacity-70" />
      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple">A world of its own</p>
        <h1 className="display mt-3 text-6xl text-chrome sm:text-7xl">Arabic House</h1>
        <p className="mt-5 max-w-xl text-fog">Where dabke rhythms, oud and darbuka meet deep, driving house. A signature MXK sound.</p>

        <div className="mt-14 space-y-16">
          {releases.map((r, i) => (
            <Reveal key={r.id}>
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className={`overflow-hidden rounded-2xl border border-line ${i % 2 ? "lg:order-2" : ""}`}>
                  {(r.embedUrl || r.youtube) ? (
                    <div className="aspect-video"><iframe src={toEmbed(r.embedUrl || r.youtube!)} title={r.title} className="h-full w-full" allowFullScreen /></div>
                  ) : mediaUrl(r.artwork) ? (
                    <img src={mediaUrl(r.artwork)} alt={r.title} className="aspect-video w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <h2 className="display text-4xl text-chrome">{r.title}</h2>
                  <p className="mt-1 text-sm text-fog">{formatDate(r.releaseDate)}</p>
                  {r.description && <p className="mt-4 leading-relaxed text-fog">{r.description}</p>}
                  <Link to={`/music/${r.slug}`} className="mt-5 inline-flex rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-chrome transition hover:border-chrome">Open release →</Link>
                </div>
              </div>
            </Reveal>
          ))}
          {releases.length === 0 && <p className="text-fog">Arabic House releases coming soon.</p>}
        </div>
      </div>
    </div>
  );
}
