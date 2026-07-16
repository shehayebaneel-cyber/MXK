import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { Settings } from "../types";

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-line bg-ink-3 p-6">
    <h2 className="text-xs font-bold uppercase tracking-widest text-blue">{title}</h2>
    <div className="mt-3 text-sm leading-relaxed text-fog">{children}</div>
  </div>
);

export function EPK() {
  useMeta("EPK — MXK", "MXK electronic press kit: bio, photos, logos, streaming links, riders and booking.");
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => { api.get<Settings>("/api/settings").then(setSettings).catch(() => {}); }, []);

  const links = settings ? ([
    ["Spotify", settings.spotify], ["Apple Music", settings.appleMusic], ["SoundCloud", settings.soundcloud],
    ["Beatport", settings.beatport], ["YouTube", settings.youtube], ["Instagram", settings.instagram],
  ] as const).filter(([, h]) => h) : [];

  return (
    <div className="mx-auto max-w-4xl px-6 pb-28 pt-28 sm:pt-32 print:pb-0 print:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">Press Kit</p>
          <h1 className="display mt-3 text-6xl text-chrome sm:text-7xl">EPK</h1>
        </div>
        <button onClick={() => window.print()} className="rounded-full bg-chrome px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white print:hidden">Download / Print</button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Block title="Biography">{settings?.bio}</Block></div>
        <Block title="Streaming & Social">
          <div className="flex flex-wrap gap-2">
            {links.length ? links.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-chrome transition hover:border-chrome">{label} ↗</a>
            )) : "Links coming soon."}
          </div>
        </Block>
        <Block title="Contact">
          Booking, management & press enquiries:{" "}
          {settings?.bookingEmail ? <a className="text-chrome underline" href={`mailto:${settings.bookingEmail}`}>{settings.bookingEmail}</a> : <Link to="/contact" className="text-chrome underline">use the contact form</Link>}.
        </Block>
        <Block title="Technical Rider">DJ: 2× CDJ + mixer (Pioneer standard), or DJ + live drum kit setup for hybrid sets. Full rider available on request.</Block>
        <Block title="Hospitality Rider">Standard artist hospitality. Detailed rider shared on confirmation.</Block>
        <Block title="Press Photos & Logos">High-resolution photos and logo pack available on request — contact booking.</Block>
      </div>
    </div>
  );
}
