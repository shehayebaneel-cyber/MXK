import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { MXKEvent } from "../types";

export function EventDetail() {
  const { slug } = useParams();
  const [e, setE] = useState<MXKEvent | null>(null);
  const [missing, setMissing] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setE(null); setMissing(false);
    api.get<MXKEvent>(`/api/events/${slug}`).then(setE).catch(() => setMissing(true));
  }, [slug]);

  useMeta(e ? `${e.title} — MXK Live` : "MXK Live", e?.description || undefined);

  if (missing) return <div className="px-6 pt-40 text-center text-fog">Event not found. <Link to="/live" className="text-chrome underline">Back to Live</Link></div>;
  if (!e) return <div className="pt-40 text-center text-fog">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:pt-32">
      <Link to="/live" className="text-sm text-fog transition hover:text-chrome">← Live</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        {mediaUrl(e.poster) && (
          <div className="overflow-hidden rounded-3xl border border-line bg-ink-3">
            <img src={mediaUrl(e.poster)} alt={e.title} className="w-full object-cover" />
          </div>
        )}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue">{formatDate(e.date)}</p>
          <h1 className="display mt-2 text-5xl text-chrome sm:text-6xl">{e.title}</h1>
          <p className="mt-2 text-lg text-fog">{[e.venue, e.city].filter(Boolean).join(" · ")}</p>
          {e.description && <p className="mt-5 max-w-xl leading-relaxed text-fog">{e.description}</p>}
          {e.ticketUrl && (
            <a href={e.ticketUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-chrome px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-white">Get Tickets ↗</a>
          )}
          {e.tracklist && (
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-fog">Tracklist</h2>
              <ol className="mt-3 space-y-1 text-sm text-fog">
                {e.tracklist.split("\n").filter(Boolean).map((t, i) => <li key={i}><span className="text-chrome/40">{String(i + 1).padStart(2, "0")}</span> {t}</li>)}
              </ol>
            </div>
          )}
        </div>
      </div>

      {e.photos.length > 0 && (
        <div className="mt-14">
          <h2 className="display text-3xl text-chrome">Gallery</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {e.photos.map((src, i) => (
              <button key={i} onClick={() => setLightbox(mediaUrl(src))} className="aspect-square overflow-hidden rounded-xl border border-line bg-ink-3">
                <img src={mediaUrl(src)} alt="" loading="lazy" className="h-full w-full object-cover transition hover:scale-105" />
              </button>
            ))}
          </div>
        </div>
      )}

      {e.videos.length > 0 && (
        <div className="mt-12 space-y-4">
          {e.videos.map((v, i) => (
            <div key={i} className="aspect-video overflow-hidden rounded-2xl border border-line">
              <iframe src={v} title={`video-${i}`} className="h-full w-full" allowFullScreen />
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-[92vh] max-w-full rounded-lg object-contain" />
          <button className="absolute right-5 top-5 text-2xl text-chrome">✕</button>
        </div>
      )}
    </div>
  );
}
