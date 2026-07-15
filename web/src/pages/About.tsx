import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { api, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { Settings } from "../types";

const TIMELINE = [
  { year: "Roots", text: "Born into rhythm in Lebanon 🇱🇧 — drums first, everything else after." },
  { year: "Live", text: "Years behind the kit, playing stages and sessions across the region." },
  { year: "Production", text: "Moved from performing to producing — building tracks from the ground up." },
  { year: "Canada", text: "Relocated to Canada 🇨🇦, bringing the sound to a new scene." },
  { year: "Arabic House", text: "Fused heritage and the dancefloor into a signature Arabic House sound." },
];

const TAGS = ["Producer", "Drummer", "DJ", "Lebanon 🇱🇧", "Canada 🇨🇦"];

export function About() {
  useMeta("About — MXK", "MXK (Makram): producer, drummer and DJ between Lebanon and Canada.");
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => { api.get<Settings>("/api/settings").then(setSettings).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-28 pt-28 sm:pt-32">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">About</p>
      <h1 className="display mt-3 text-6xl text-chrome sm:text-7xl">MXK // MAKRAM</h1>

      <div className="mt-8 grid gap-8 sm:grid-cols-[220px_1fr] sm:items-start">
        {mediaUrl(settings?.heroImage) && (
          <img src={mediaUrl(settings?.heroImage)} alt="MXK" className="aspect-square w-full rounded-2xl border border-line object-cover" />
        )}
        <div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => <span key={t} className="rounded-full border border-line px-4 py-1.5 text-sm text-fog">{t}</span>)}
          </div>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">{settings?.bio}</p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="display text-3xl text-chrome">The Journey</h2>
        <div className="mt-6 space-y-0">
          {TIMELINE.map((t, i) => (
            <Reveal key={i}>
              <div className="flex gap-5 border-l border-line pb-8 pl-6 last:pb-0">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-blue">{t.year}</p>
                  <p className="mt-1 max-w-xl leading-relaxed text-fog">{t.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link to="/contact" className="rounded-full bg-chrome px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-white">Contact</Link>
        <Link to="/epk" className="rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-chrome transition hover:border-chrome">Press Kit</Link>
      </div>
    </div>
  );
}
