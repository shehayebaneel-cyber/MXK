import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { ReleaseCard, toTrack } from "../components/ReleaseCard";
import { StreamingLinks } from "../components/StreamingLinks";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useCountdown } from "../lib/useCountdown";
import { useMeta } from "../lib/useMeta";
import { usePlayer } from "../player/PlayerContext";
import type { Release, Settings } from "../types";

function Countdown({ target }: { target: string }) {
  const t = useCountdown(target);
  if (!t) return null;
  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center">
      <span className="display text-4xl text-chrome tabular-nums sm:text-5xl">{String(n).padStart(2, "0")}</span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-fog">{l}</span>
    </div>
  );
  return (
    <div className="flex gap-5 sm:gap-8">
      {cell(t.days, "Days")}{cell(t.hours, "Hrs")}{cell(t.minutes, "Min")}{cell(t.seconds, "Sec")}
    </div>
  );
}

export function Home() {
  useMeta("MXK // MAKRAM — Producer, Drummer, DJ", "The official home of MXK (Makram) — producer, drummer and DJ. Latest releases, live shows, and booking.");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [featured, setFeatured] = useState<Release | null>(null);
  const [latest, setLatest] = useState<Release[]>([]);
  const player = usePlayer();

  useEffect(() => {
    api.get<Settings>("/api/settings").then(setSettings).catch(() => {});
    api.get<Release | null>("/api/releases/featured").then(setFeatured).catch(() => {});
    api.get<Release[]>("/api/releases").then((r) => setLatest(r.slice(0, 6))).catch(() => {});
  }, []);

  const unreleased = featured && new Date(featured.releaseDate).getTime() > Date.now();
  const heroVideo = mediaUrl(settings?.heroVideo);
  const heroImage = mediaUrl(settings?.heroImage);

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {heroVideo ? (
            <video src={heroVideo} autoPlay muted loop playsInline className="h-full w-full object-cover opacity-60" />
          ) : heroImage ? (
            <img src={heroImage} alt="" className="h-full w-full object-cover object-center opacity-70" />
          ) : (
            <div className="glow h-full w-full" />
          )}
          <div className="glow absolute inset-0 opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">Producer • Drummer • DJ</p>
          <h1 className="display mt-4 text-6xl text-chrome sm:text-8xl lg:text-9xl">
            MXK <span className="text-fog">//</span> MAKRAM
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">
            Live percussion meets electronic production — a sound moving between Beirut and Montréal, and a growing Arabic House world.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/music" className="rounded-full bg-chrome px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-white">Listen Now</Link>
            <Link to="/booking" className="rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-chrome transition hover:border-chrome">Book MXK</Link>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-fog pulse">Scroll ↓</div>
      </section>

      {/* ---------- LATEST RELEASE ---------- */}
      {featured && (
        <section className="relative overflow-hidden border-t border-line py-20 sm:py-28">
          <div className="glow absolute inset-0 -z-10 opacity-60" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
            <Reveal>
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-line bg-ink-3 shadow-2xl">
                {mediaUrl(featured.artwork) ? (
                  <img src={mediaUrl(featured.artwork)} alt={featured.title} className="h-full w-full object-cover" />
                ) : <div className="flex h-full items-center justify-center text-fog">MXK</div>}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">
                {unreleased ? "Coming Soon" : "Latest Release"}
              </p>
              <h2 className="display mt-3 text-5xl text-chrome sm:text-6xl">{featured.title}</h2>
              {featured.featuredArtists && <p className="mt-2 text-lg text-fog">{featured.featuredArtists}</p>}
              <p className="mt-2 text-sm text-fog">{formatDate(featured.releaseDate)}</p>
              {featured.description && <p className="mt-4 max-w-md leading-relaxed text-fog">{featured.description}</p>}

              <div className="mt-8">
                {unreleased ? (
                  <div className="space-y-6">
                    <Countdown target={featured.releaseDate} />
                    <a href={featured.spotify || settings?.spotify || "#"} target="_blank" rel="noreferrer"
                      className="inline-flex rounded-full bg-gradient-to-r from-blue to-purple px-8 py-3.5 text-sm font-semibold text-white transition hover:opacity-90">
                      Pre-Save on Spotify
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featured.previewUrl && (
                      <button onClick={() => player.play([toTrack(featured)])}
                        className="rounded-full bg-chrome px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-white">▶ Play preview</button>
                    )}
                    <StreamingLinks release={featured} />
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- LATEST MUSIC RAIL ---------- */}
      {latest.length > 0 && (
        <section className="border-t border-line py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <Reveal><h2 className="display text-4xl text-chrome sm:text-5xl">The Music</h2></Reveal>
              <Link to="/music" className="text-sm font-semibold text-fog transition hover:text-chrome">View all →</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {latest.map((r, i) => <Reveal key={r.id} delay={i * 60}><ReleaseCard release={r} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {/* ---------- SOCIAL HUB ---------- */}
      <section className="border-t border-line py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <h2 className="display text-4xl text-chrome sm:text-5xl">Enter MXK's World</h2>
            <p className="mx-auto mt-3 max-w-lg text-fog">Follow the journey and listen everywhere.</p>
          </Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {settings && ([
              ["Instagram", settings.instagram], ["Spotify", settings.spotify], ["Apple Music", settings.appleMusic],
              ["Anghami", settings.anghami], ["SoundCloud", settings.soundcloud], ["YouTube", settings.youtube],
            ] as const).filter(([, h]) => h).map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-chrome transition hover:border-chrome hover:bg-ink-3">{label} ↗</a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
