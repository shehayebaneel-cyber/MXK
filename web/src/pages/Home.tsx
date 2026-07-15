import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Equalizer } from "../components/Equalizer";
import { PlatformIcon } from "../components/PlatformIcon";
import { Reveal } from "../components/Reveal";
import { ReleaseCard, toTrack } from "../components/ReleaseCard";
import { StreamingLinks } from "../components/StreamingLinks";
import { Tilt } from "../components/Tilt";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useCountdown } from "../lib/useCountdown";
import { useMeta } from "../lib/useMeta";
import { usePlayer } from "../player/PlayerContext";
import type { MXKEvent, Release, Settings } from "../types";

function Countdown({ target }: { target: string }) {
  const t = useCountdown(target);
  if (!t) return null;
  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center">
      <span className="display text-4xl text-chrome tabular-nums sm:text-5xl">{String(n).padStart(2, "0")}</span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-fog">{l}</span>
    </div>
  );
  return <div className="flex gap-6 sm:gap-10">{cell(t.days, "Days")}{cell(t.hours, "Hrs")}{cell(t.minutes, "Min")}{cell(t.seconds, "Sec")}</div>;
}

// Compact upcoming-show card for the homepage Live strip.
function ShowCard({ e }: { e: MXKEvent }) {
  const d = new Date(e.date);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const hasTickets = e.ticketsEnabled || !!e.ticketUrl;
  return (
    <Link to={`/live/${e.slug}`} className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-ink-2/40 p-3 transition hover:border-white/20 hover:bg-ink-2 sm:p-4">
      {/* date chip */}
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-ink-3 sm:h-20 sm:w-20">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue">{month}</span>
        <span className="display text-2xl leading-none text-chrome sm:text-3xl">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-xl leading-tight text-chrome sm:text-2xl">{e.title}</h3>
        <p className="mt-0.5 truncate text-sm text-fog">{[e.venue, e.city].filter(Boolean).join(" · ")}</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {hasTickets && <span className="rounded-full bg-chrome px-2.5 py-1 font-semibold text-ink">🎟 Tickets</span>}
          <span className="font-semibold uppercase tracking-widest text-fog transition group-hover:text-chrome">Details →</span>
        </div>
      </div>
    </Link>
  );
}

// Floating glass "latest release" panel suspended in front of the hero portrait.
function HeroReleaseCard({ release, unreleased }: { release: Release; unreleased: boolean }) {
  const player = usePlayer();
  const playing = player.isPlaying && player.current?.id === release.id;
  const links: [keyof Release, string][] = [["spotify", "Spotify"], ["appleMusic", "Apple Music"], ["soundcloud", "SoundCloud"]];
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-2/55 p-4 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/5 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-3">
          {mediaUrl(release.artwork) ? <img src={mediaUrl(release.artwork)} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue">{unreleased ? "Coming soon" : "Latest release"}</p>
            <Equalizer active={!!playing} bars={4} className="h-2.5" />
          </div>
          <Link to={`/music/${release.slug}`} className="block truncate font-display text-lg leading-tight text-chrome hover:text-blue">{release.title}</Link>
          <p className="truncate text-xs text-fog">{[release.featuredArtists, formatDate(release.releaseDate)].filter(Boolean).join(" · ")}</p>
        </div>
        {release.previewUrl && (
          <button onClick={() => (playing ? player.toggle() : player.play([toTrack(release)]))} aria-label="Play preview" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chrome text-ink transition hover:scale-105">{playing ? "❚❚" : "▶"}</button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {links.filter(([k]) => release[k]).map(([k, label]) => (
          <a key={k} href={String(release[k])} target="_blank" rel="noreferrer" title={label}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-fog transition hover:border-chrome hover:text-chrome">
            <PlatformIcon name={label} className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  useMeta("MXK // MAKRAM — Producer, Drummer, DJ", "The official home of MXK (Makram) — Lebanese-Canadian producer, drummer and DJ. Latest releases, live shows, and how to get in touch.");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [featured, setFeatured] = useState<Release | null>(null);
  const [latest, setLatest] = useState<Release[]>([]);
  const [shows, setShows] = useState<MXKEvent[]>([]);
  const player = usePlayer();

  useEffect(() => {
    api.get<Settings>("/api/settings").then(setSettings).catch(() => {});
    api.get<Release | null>("/api/releases/featured").then(setFeatured).catch(() => {});
    api.get<Release[]>("/api/releases").then((r) => setLatest(r.slice(0, 6))).catch(() => {});
    api.get<{ upcoming: MXKEvent[] }>("/api/events").then((d) => setShows((d.upcoming || []).slice(0, 4))).catch(() => {});
  }, []);

  const unreleased = !!featured && new Date(featured.releaseDate).getTime() > Date.now();
  const heroVideo = mediaUrl(settings?.heroVideo);
  const heroImage = mediaUrl(settings?.heroImage) || "/artwork/mxk-portrait.jpg";

  // Ambient floating particles (generated once).
  const particles = useMemo(() => Array.from({ length: 22 }, () => ({
    left: Math.random() * 100, size: 1 + Math.random() * 2.5, delay: Math.random() * 12, dur: 9 + Math.random() * 11,
  })), []);

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-[88svh] items-center overflow-hidden pt-20 sm:min-h-[92svh] sm:pt-24">
        {/* Living background */}
        <div className="absolute inset-0 -z-20 bg-ink" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="aurora" style={{ width: "42rem", height: "42rem", top: "-12rem", left: "-8rem", background: "radial-gradient(circle, rgba(79,124,255,0.45), transparent 60%)", animation: "drift 17s ease-in-out infinite" }} />
          <div className="aurora" style={{ width: "34rem", height: "34rem", top: "10%", right: "-8rem", background: "radial-gradient(circle, rgba(154,92,255,0.42), transparent 60%)", animation: "drift 21s ease-in-out infinite reverse" }} />
          <div className="aurora" style={{ width: "26rem", height: "26rem", bottom: "-8rem", left: "35%", background: "radial-gradient(circle, rgba(255,59,87,0.22), transparent 60%)", animation: "drift 19s ease-in-out infinite" }} />
          <div className="grain absolute inset-0 opacity-[0.05]" />
          {particles.map((p, i) => (
            <span key={i} className="particle" style={{ left: `${p.left}%`, width: p.size, height: p.size, animation: `floaty ${p.dur}s linear ${p.delay}s infinite` }} />
          ))}
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT — text */}
          <div>
            <p className="rise-in text-sm font-semibold uppercase tracking-[0.3em] text-blue" style={{ animationDelay: "0.05s" }}>Producer • Drummer • DJ</p>
            <h1 className="mt-3 text-6xl text-chrome sm:mt-4 sm:text-7xl lg:text-8xl">
              <span className="rise-in display block" style={{ animationDelay: "0.15s" }}>MXK <span className="text-fog">//</span></span>
              <span className="rise-in display block" style={{ animationDelay: "0.28s" }}>MAKRAM</span>
            </h1>
            <p className="rise-in mt-4 max-w-md text-base leading-relaxed text-fog sm:mt-6 sm:text-lg" style={{ animationDelay: "0.42s" }}>
              Live drums meet electronic soul — <span className="whitespace-nowrap text-chrome">Arab Melodic House</span>, from Beirut to Canada.
            </p>
            <div className="rise-in mt-6 flex gap-3 sm:mt-8" style={{ animationDelay: "0.55s" }}>
              <Link to="/music" className="flex-1 rounded-full bg-chrome py-4 text-center text-sm font-semibold text-ink transition hover:bg-white sm:flex-none sm:px-7 sm:py-3.5">Listen Now</Link>
              <Link to="/contact" className="flex-1 rounded-full border border-line py-4 text-center text-sm font-semibold text-chrome transition hover:border-chrome sm:flex-none sm:px-7 sm:py-3.5">Contact</Link>
            </div>
            {/* Social proof — location always; roles/streaming are redundant on
                mobile (roles are in the eyebrow, platforms in the section below). */}
            <div className="rise-in mt-6 space-y-3 sm:mt-8" style={{ animationDelay: "0.7s" }}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-line px-3 py-1.5 text-fog">📍 Lebanon 🇱🇧 &amp; Canada 🇨🇦</span>
                <span className="hidden rounded-full border border-line px-3 py-1.5 text-fog sm:inline-flex">Producer</span>
                <span className="hidden rounded-full border border-line px-3 py-1.5 text-fog sm:inline-flex">Drummer</span>
                <span className="hidden rounded-full border border-line px-3 py-1.5 text-fog sm:inline-flex">DJ</span>
              </div>
              <p className="hidden flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fog sm:flex">
                <span className="uppercase tracking-widest text-fog/70">Streaming on</span>
                {["Spotify", "Apple Music", "SoundCloud", "Anghami", "YouTube"].map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 text-chrome/80"><PlatformIcon name={n} className="h-3.5 w-3.5" /> {n}</span>
                ))}
              </p>
            </div>
          </div>

          {/* RIGHT — cinematic 3D visual + floating glass card */}
          <div className="scale-in relative mx-auto w-[72%] max-w-[16.5rem] [perspective:1100px] sm:w-full sm:max-w-sm" style={{ animationDelay: "0.4s" }}>
            {/* blue/purple glow behind, for separation + depth */}
            <div className="absolute -inset-6 -z-10 rounded-[2.75rem] bg-gradient-to-tr from-blue/35 via-purple/25 to-transparent blur-3xl" />
            <Tilt className="tilt relative" maxRX={4} maxRY={6} scale={1.02}>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_36px_90px_-24px_rgba(79,124,255,0.45)] float-slow">
                {heroVideo ? (
                  <video src={heroVideo} autoPlay muted loop playsInline className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <img src={heroImage} alt="MXK" className="aspect-[4/5] w-full object-cover object-top" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
                <div className="tilt-sheen" />
              </div>
              {featured && (
                <div className="rise-in mt-4 lg:absolute lg:inset-x-4 lg:bottom-4 lg:mt-0" style={{ animationDelay: "0.9s" }}>
                  <div className="pop">
                    <HeroReleaseCard release={featured} unreleased={unreleased} />
                  </div>
                </div>
              )}
            </Tilt>
          </div>
        </div>

        {/* Scroll cue — desktop only; on mobile it collided with the release card */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-xs uppercase tracking-widest text-fog pulse lg:block">Scroll ↓</div>
      </section>

      {/* ---------- LATEST RELEASE (detail + countdown) ---------- */}
      {featured && (
        <section className="relative overflow-hidden border-t border-line py-14 sm:py-28">
          <div className="glow absolute inset-0 -z-10 opacity-60" />
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 sm:gap-10 lg:grid-cols-2">
            <Reveal>
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-line bg-ink-3 shadow-2xl">
                {mediaUrl(featured.artwork) ? <img src={mediaUrl(featured.artwork)} alt={featured.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-fog">MXK</div>}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">{unreleased ? "Coming Soon" : "Latest Release"}</p>
              <h2 className="display mt-3 text-5xl text-chrome sm:text-6xl">{featured.title}</h2>
              {featured.featuredArtists && <p className="mt-2 text-lg text-fog">{featured.featuredArtists}</p>}
              <p className="mt-2 text-sm text-fog">{formatDate(featured.releaseDate)}</p>
              {featured.description && <p className="mt-4 max-w-md leading-relaxed text-fog">{featured.description}</p>}
              <div className="mt-8">
                {unreleased ? (
                  <div className="space-y-6">
                    <Countdown target={featured.releaseDate} />
                    <a href={featured.spotify || settings?.spotify || "#"} target="_blank" rel="noreferrer" className="flex justify-center rounded-full bg-gradient-to-r from-blue to-purple px-8 py-4 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-flex sm:py-3.5">Pre-Save on Spotify</a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featured.previewUrl && <button onClick={() => player.play([toTrack(featured)])} className="w-full rounded-full bg-chrome px-8 py-4 text-sm font-semibold text-ink transition hover:bg-white sm:w-auto sm:py-3.5">▶ Play preview</button>}
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
        <section className="border-t border-line py-14 sm:py-24">
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

      {/* ---------- LIVE / UPCOMING SHOWS ---------- */}
      {shows.length > 0 && (
        <section className="relative overflow-hidden border-t border-line py-14 sm:py-24">
          <div className="glow absolute inset-0 -z-10 opacity-40" />
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <Reveal>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">On Stage</p>
                <h2 className="display mt-2 text-4xl text-chrome sm:text-5xl">Catch MXK Live</h2>
              </Reveal>
              <Link to="/live" className="shrink-0 text-sm font-semibold text-fog transition hover:text-chrome">All shows →</Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {shows.map((e, i) => <Reveal key={e.id} delay={i * 60}><ShowCard e={e} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {/* ---------- SOCIAL HUB ---------- */}
      <section className="border-t border-line py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <h2 className="display text-4xl text-chrome sm:text-5xl">Enter MXK's World</h2>
            <p className="mx-auto mt-3 max-w-lg text-fog">Follow the journey and listen everywhere.</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
            {settings && ([
              ["Instagram", settings.instagram], ["Spotify", settings.spotify], ["Apple Music", settings.appleMusic],
              ["Anghami", settings.anghami], ["SoundCloud", settings.soundcloud], ["YouTube", settings.youtube],
            ] as const).filter(([, h]) => h).map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-semibold text-chrome transition hover:border-chrome hover:bg-ink-3 sm:px-6">
                <PlatformIcon name={label} /> {label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
