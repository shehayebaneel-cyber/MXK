import { useEffect, useMemo, useRef, useState } from "react";
import { api, formatDate, mediaUrl } from "../lib/api";
import { usePlayer } from "../player/PlayerContext";
import type { Release } from "../types";
import { toTrack } from "./ReleaseCard";
import { Equalizer } from "./Equalizer";

const SEEN_KEY = "mxk-seen-intro"; // has the visitor been here before
const PREF_KEY = "mxk-music-pref"; // "on" | "off" — did they choose music last time

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

/**
 * First-visit "enter MXK's world" gate. A full-screen splash over the site:
 * MXK wordmark, the featured song as a Now Playing card, and a big circular
 * Play button. Tapping Play (or anywhere) starts the featured track and fades
 * into the site — the persistent <audio> in PlayerContext keeps it playing as
 * the visitor navigates. Shown once per browser; returning visitors who chose
 * music resume automatically (where the browser allows).
 */
export function EnterExperience() {
  const player = usePlayer();
  const [featured, setFeatured] = useState<Release | null>(null);
  // Show the gate only on a genuine first visit — computed synchronously so the
  // homepage never flashes behind it.
  const [show, setShow] = useState(() => read(SEEN_KEY) !== "1");
  const [leaving, setLeaving] = useState(false);
  const resumed = useRef(false);

  useEffect(() => {
    api.get<Release | null>("/api/releases/featured").then(setFeatured).catch(() => {});
  }, []);

  // Returning visitor who previously chose music: resume the featured track once
  // it loads. Browsers may block audio without a fresh gesture — in that case the
  // floating player simply appears paused, one tap from resuming. No autoplay hacks.
  useEffect(() => {
    if (show || resumed.current || !featured) return;
    resumed.current = true;
    if (read(PREF_KEY) === "on" && featured.previewUrl) player.play([toTrack(featured)]);
  }, [show, featured]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  const art = mediaUrl(featured?.artwork);

  function enter(withMusic: boolean) {
    write(SEEN_KEY, "1");
    write(PREF_KEY, withMusic ? "on" : "off");
    if (withMusic && featured?.previewUrl) player.play([toTrack(featured)]);
    setLeaving(true);
    // Unmount after the fade so the homepage is fully interactive.
    window.setTimeout(() => setShow(false), 640);
  }

  return (
    <div
      role="dialog"
      aria-label="Enter MXK"
      onClick={() => enter(true)}
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-ink px-6 transition-opacity duration-[600ms] ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Living background — reuses the hero atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora" style={{ width: "40rem", height: "40rem", top: "-10rem", left: "-6rem", background: "radial-gradient(circle, rgba(79,124,255,0.4), transparent 60%)", animation: "drift 18s ease-in-out infinite" }} />
        <div className="aurora" style={{ width: "32rem", height: "32rem", bottom: "-8rem", right: "-6rem", background: "radial-gradient(circle, rgba(154,92,255,0.38), transparent 60%)", animation: "drift 22s ease-in-out infinite reverse" }} />
        <div className="grain absolute inset-0 opacity-[0.05]" />
      </div>

      <Sparks />

      <div className="scale-in flex w-full max-w-md flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-blue">Welcome to</p>
        <h1 className="display mt-3 text-7xl leading-none text-chrome sm:text-8xl">MXK</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-fog">// MAKRAM</p>

        {/* Now Playing card */}
        <div className="mt-9 w-full rounded-3xl border border-white/10 bg-ink-2/60 p-5 shadow-[0_36px_90px_-30px_rgba(79,124,255,0.5)] ring-1 ring-inset ring-white/5 backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-left">
            <Equalizer active bars={5} className="h-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue">Now Playing</p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-left">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-3">
              {art ? <img src={art} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-fog">MXK</div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl leading-tight text-chrome">{featured?.title ?? "MXK"}</p>
              <p className="truncate text-sm text-fog">
                {featured ? [featured.featuredArtists || "MXK", formatDate(featured.releaseDate)].filter(Boolean).join(" · ") : "Featured track"}
              </p>
            </div>
          </div>

          {/* Big circular Play */}
          <button
            onClick={(e) => { e.stopPropagation(); enter(true); }}
            aria-label="Play & enter"
            className="group relative mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-chrome text-ink shadow-[0_18px_50px_-12px_rgba(255,255,255,0.5)] transition hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full ring-2 ring-white/40 pulse" />
            <span className="ml-1 text-3xl">▶</span>
          </button>
          <p className="mt-4 text-xs text-fog">Tap to play &amp; enter</p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); enter(false); }}
          className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-fog/70 transition hover:text-chrome"
        >
          Enter without music
        </button>
      </div>
    </div>
  );
}

// A few rising sparks for life on the splash (generated once).
function Sparks() {
  const sparks = useMemo(
    () => Array.from({ length: 16 }, () => ({ left: Math.random() * 100, size: 1 + Math.random() * 2, delay: Math.random() * 10, dur: 9 + Math.random() * 10 })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {sparks.map((p, i) => (
        <span key={i} className="particle" style={{ left: `${p.left}%`, width: p.size, height: p.size, animation: `floaty ${p.dur}s linear ${p.delay}s infinite` }} />
      ))}
    </div>
  );
}
