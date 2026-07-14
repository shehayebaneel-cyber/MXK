import { ReactNode, useEffect, useState } from "react";
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

// Footer column: an accordion on mobile, always-expanded on desktop.
function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-line md:border-t-0">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-4 text-left md:pointer-events-none md:py-0">
        <span className="text-xs font-bold uppercase tracking-widest text-fog">{title}</span>
        <span className="text-lg text-fog md:hidden">{open ? "−" : "+"}</span>
      </button>
      <div className={`${open ? "block" : "hidden"} pb-5 md:mt-4 md:!block md:pb-0`}>{children}</div>
    </div>
  );
}

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
      </header>

      {/* Full-screen mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fade-in absolute inset-0 bg-ink/70 backdrop-blur-2xl" onClick={() => setOpen(false)} />
          <div className="menu-in pb-safe absolute inset-y-0 right-0 flex w-full flex-col bg-ink/95 px-6 pt-5">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setOpen(false)} className="display text-2xl text-chrome">MXK</Link>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-2xl leading-none text-chrome">✕</button>
            </div>
            <nav className="mt-8 flex flex-1 flex-col justify-center gap-1">
              {NAV.map((l, i) => (
                <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} style={{ animationDelay: `${0.05 + i * 0.04}s` }}
                  className={({ isActive }) => `rise-in display py-2 text-4xl transition ${isActive ? "text-chrome" : "text-fog"}`}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <Link to="/booking" onClick={() => setOpen(false)} className="mt-4 rounded-full bg-chrome px-6 py-4 text-center text-base font-semibold text-ink">Book MXK</Link>
            <div className="mt-6 flex justify-center gap-3">
              {SOCIAL.map((s) => settings?.[s.key] ? (
                <a key={s.key} href={settings[s.key]} target="_blank" rel="noreferrer" aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-fog transition hover:border-chrome hover:text-chrome">
                  <PlatformIcon name={s.label} className="h-5 w-5" />
                </a>
              ) : null)}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-6xl px-6 py-12 md:flex md:items-start md:justify-between md:gap-12">
          <div className="mb-2 md:mb-0 md:max-w-sm">
            <p className="display text-3xl text-chrome sm:text-4xl">MXK // MAKRAM</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fog">Producer • Drummer • DJ — moving between Lebanon 🇱🇧 and Canada 🇨🇦.</p>
            <Link to="/booking" className="mt-5 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-chrome transition hover:border-chrome">Book MXK →</Link>
          </div>
          <div className="md:grid md:flex-1 md:grid-cols-3 md:gap-10 lg:max-w-2xl">
            <FooterCol title="Explore">
              <ul className="space-y-2.5 text-sm text-fog">
                {NAV.filter((l) => l.to !== "/").map((l) => <li key={l.to}><Link to={l.to} className="transition hover:text-chrome">{l.label}</Link></li>)}
              </ul>
            </FooterCol>
            <FooterCol title="Listen & Follow">
              <ul className="space-y-2.5 text-sm text-fog">
                {SOCIAL.map((s) => settings?.[s.key] ? (
                  <li key={s.key}>
                    <a href={settings[s.key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-chrome">
                      <PlatformIcon name={s.label} className="h-4 w-4 shrink-0" /> {s.label}
                    </a>
                  </li>
                ) : null)}
              </ul>
            </FooterCol>
            <FooterCol title="Contact">
              <div className="space-y-2.5 text-sm text-fog">
                {settings?.bookingEmail && <a href={`mailto:${settings.bookingEmail}`} className="block break-all transition hover:text-chrome">{settings.bookingEmail}</a>}
                <Link to="/booking" className="block transition hover:text-chrome">Booking form →</Link>
              </div>
            </FooterCol>
          </div>
        </div>
        <div className="pb-safe border-t border-line py-5 text-center text-xs text-fog">© {new Date().getFullYear()} MXK. All rights reserved.</div>
      </footer>

      <FloatingPlayer />
    </div>
  );
}
