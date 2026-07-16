import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { api } from "../lib/api";
import type { Settings } from "../types";
import { CursorGlow } from "./CursorGlow";
import { EnterExperience } from "./EnterExperience";
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
    api
      .get<Settings>("/api/settings")
      .then(setSettings)
      .catch(() => {});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <CursorGlow />
      <header
        className={`nav-in fixed inset-x-0 top-0 z-40 transition-all duration-300 print:hidden ${scrolled ? "border-line bg-ink/80 border-b backdrop-blur-xl" : "bg-transparent"}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="display text-chrome text-2xl tracking-wide">
            MXK
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${isActive ? "text-chrome" : "text-fog hover:text-chrome"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/contact" className="bg-chrome text-ink hidden rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white sm:inline-flex">
              Contact
            </Link>
            <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="text-chrome rounded-lg p-2 lg:hidden">
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-line bg-ink/95 border-t px-4 py-3 backdrop-blur-xl lg:hidden">
            {NAV.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-base font-medium ${isActive ? "text-chrome" : "text-fog"}`}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="bg-chrome text-ink mt-2 block rounded-full px-4 py-2.5 text-center text-sm font-semibold"
            >
              Contact
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-line bg-ink-2 border-t print:hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="display text-chrome text-4xl">MXK // MAKRAM</p>
            <p className="text-fog mt-3 max-w-sm text-sm leading-relaxed">Producer • Drummer • DJ — moving between Lebanon 🇱🇧 and Canada 🇨🇦.</p>
            <Link
              to="/contact"
              className="border-line text-chrome hover:border-chrome mt-5 inline-flex rounded-full border px-5 py-2.5 text-sm font-semibold transition"
            >
              Get in Touch →
            </Link>
          </div>
          <div>
            <p className="text-fog text-xs font-bold uppercase tracking-widest">Explore</p>
            <ul className="text-fog mt-4 space-y-2 text-sm">
              {NAV.filter((l) => l.to !== "/").map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-chrome transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-fog text-xs font-bold uppercase tracking-widest">Listen & Follow</p>
            <ul className="text-fog mt-4 space-y-2 text-sm">
              {SOCIAL.map((s) => {
                const href = settings?.[s.key];
                return href ? (
                  <li key={s.key}>
                    <a href={href} target="_blank" rel="noreferrer" className="hover:text-chrome flex items-center gap-2 transition">
                      <PlatformIcon name={s.label} className="h-4 w-4 shrink-0" /> {s.label}
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        </div>
        <div className="border-line text-fog border-t py-5 text-center text-xs">© {new Date().getFullYear()} MXK. All rights reserved.</div>
      </footer>

      <FloatingPlayer />
      <EnterExperience />
    </div>
  );
}
