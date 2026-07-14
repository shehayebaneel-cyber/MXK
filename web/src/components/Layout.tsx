import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { api } from "../lib/api";
import type { Settings } from "../types";
import { CursorGlow } from "./CursorGlow";
import { FloatingPlayer } from "./FloatingPlayer";
import { PlatformIcon } from "./PlatformIcon";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/music", label: "Music" },
  { to: "/live", label: "Live" },
  { to: "/arabic-house", label: "Arabic House" },
  { to: "/archive", label: "Archive" },
  { to: "/about", label: "About" },
  { to: "/epk", label: "EPK" },
];

const SOCIAL: { key: keyof Settings; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "spotify", label: "Spotify" },
  { key: "appleMusic", label: "Apple Music" },
  { key: "anghami", label: "Anghami" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "youtube", label: "YouTube" },
];

export function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    api.get<Settings>("/api/settings").then(setSettings).catch(() => {});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <CursorGlow />
      <header className={`nav-in fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="display text-2xl tracking-wide text-chrome">MXK</Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${isActive ? "text-chrome" : "text-fog hover:text-chrome"}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/booking" className="hidden rounded-full bg-chrome px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white sm:inline-flex">Book MXK</Link>
            <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="rounded-lg p-2 text-chrome lg:hidden">
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-line bg-ink/95 px-4 py-3 backdrop-blur-xl lg:hidden">
            {NAV.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}
                className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-base font-medium ${isActive ? "text-chrome" : "text-fog"}`}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/booking" onClick={() => setOpen(false)} className="mt-2 block rounded-full bg-chrome px-4 py-2.5 text-center text-sm font-semibold text-ink">Book MXK</Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-ink-2">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="display text-4xl text-chrome">MXK // MAKRAM</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fog">Producer • Drummer • DJ — moving between Lebanon 🇱🇧 and Canada 🇨🇦.</p>
            <Link to="/booking" className="mt-5 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-chrome transition hover:border-chrome">Book MXK →</Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-fog">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-fog">
              {NAV.filter((l) => l.to !== "/").map((l) => <li key={l.to}><Link to={l.to} className="transition hover:text-chrome">{l.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-fog">Listen & Follow</p>
            <ul className="mt-4 space-y-2 text-sm text-fog">
              {SOCIAL.map((s) => {
                const href = settings?.[s.key];
                return href ? (
                  <li key={s.key}>
                    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-chrome">
                      <PlatformIcon name={s.label} className="h-4 w-4 shrink-0" /> {s.label}
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-fog">© {new Date().getFullYear()} MXK. All rights reserved.</div>
      </footer>

      <FloatingPlayer />
    </div>
  );
}
