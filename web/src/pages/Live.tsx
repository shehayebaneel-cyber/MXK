import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { MXKEvent } from "../types";

function EventRow({ e, past }: { e: MXKEvent; past?: boolean }) {
  return (
    <Link to={`/live/${e.slug}`} className="border-line hover:bg-ink-2/40 group flex items-center gap-4 border-b py-5 transition">
      <div className="border-line bg-ink-3 h-20 w-20 shrink-0 overflow-hidden rounded-xl border sm:h-24 sm:w-24">
        {mediaUrl(e.poster) ? (
          <img src={mediaUrl(e.poster)} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-blue text-xs uppercase tracking-widest">{formatDate(e.date)}</p>
        <h3 className="text-chrome mt-1 truncate text-xl font-semibold sm:text-2xl">{e.title}</h3>
        <p className="text-fog truncate text-sm">{[e.venue, e.city].filter(Boolean).join(" · ")}</p>
      </div>
      {!past && e.ticketsEnabled ? (
        <span className="bg-chrome text-ink hidden shrink-0 rounded-full px-5 py-2 text-sm font-semibold sm:inline-flex">🎟 Tickets</span>
      ) : !past && e.ticketUrl ? (
        <a
          href={e.ticketUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(ev) => ev.stopPropagation()}
          className="bg-chrome text-ink hidden shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition hover:bg-white sm:inline-flex"
        >
          Tickets
        </a>
      ) : null}
      <span className="text-fog transition group-hover:translate-x-1">→</span>
    </Link>
  );
}

export function Live() {
  useMeta("Live — MXK", "MXK live: upcoming shows and past performances.");
  const [data, setData] = useState<{ upcoming: MXKEvent[]; past: MXKEvent[] }>({ upcoming: [], past: [] });
  useEffect(() => {
    api
      .get<{ upcoming: MXKEvent[]; past: MXKEvent[] }>("/api/events")
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-28 pt-28 sm:pt-32">
      <h1 className="display text-chrome text-5xl sm:text-6xl">Live</h1>

      <h2 className="text-fog mt-12 text-xs font-bold uppercase tracking-widest">Upcoming Shows</h2>
      {data.upcoming.length === 0 ? (
        <p className="text-fog mt-4">No shows announced right now — check back soon.</p>
      ) : (
        <div className="mt-2">
          {data.upcoming.map((e) => (
            <Reveal key={e.id}>
              <EventRow e={e} />
            </Reveal>
          ))}
        </div>
      )}

      {data.past.length > 0 && (
        <>
          <h2 className="text-fog mt-16 text-xs font-bold uppercase tracking-widest">Past Shows</h2>
          <div className="mt-2 opacity-80">
            {data.past.map((e) => (
              <Reveal key={e.id}>
                <EventRow e={e} past />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
