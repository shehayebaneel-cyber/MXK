import { useEffect, useState } from "react";
import { PlatformIcon } from "../components/PlatformIcon";
import { Reveal } from "../components/Reveal";
import { api } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { Settings } from "../types";

const INQUIRY_TYPES = [
  "General Inquiry", "Live Performance", "DJ Booking", "Studio Production",
  "Collaboration", "Remix Request", "Press / Media", "Brand Partnership", "Other",
];

const SOCIAL: { key: keyof Settings; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "spotify", label: "Spotify" },
  { key: "appleMusic", label: "Apple Music" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "beatport", label: "Beatport" },
  { key: "youtube", label: "YouTube" },
];

const field =
  "w-full rounded-xl border border-line bg-ink-3 px-4 py-3 text-sm text-chrome placeholder:text-fog/60 outline-none transition focus:border-blue";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-fog";

export function Contact() {
  useMeta("Contact MXK", "Reach MXK for bookings, collaborations, press, brand partnerships or general inquiries.");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", subject: "", inquiryType: INQUIRY_TYPES[0], message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { api.get<Settings>("/api/settings").then(setSettings).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setErr("Name and email are required."); return; }
    setState("sending"); setErr("");
    try {
      await api.post("/api/contact", form);
      setState("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't send. Try again.");
      setState("error");
    }
  }

  const socials = SOCIAL.filter((s) => settings?.[s.key]);
  const hasBusiness = !!(settings?.bookingEmail || settings?.managementEmail || settings?.bookingAgentEmail);

  return (
    <div className="relative overflow-hidden">
      {/* ambient glow */}
      <div className="glow pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:pt-32">
        {/* ---------- HERO ---------- */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">Contact</p>
          <h1 className="display mt-3 text-5xl text-chrome sm:text-6xl lg:text-7xl">Let's Create Something Together</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">
            Whether you're looking to book a performance, collaborate on a track, invite MXK to an event, or simply get
            in touch — I'd love to hear from you.
          </p>
        </Reveal>

        {state === "done" ? (
          <Reveal>
            <div className="mt-12 rounded-3xl border border-white/10 bg-ink-2/60 p-10 text-center shadow-[0_36px_90px_-30px_rgba(79,124,255,0.5)] ring-1 ring-inset ring-white/5 backdrop-blur-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue to-purple text-3xl text-white">✓</div>
              <h2 className="display mt-6 text-4xl text-chrome">Message Sent</h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-fog">
                Thank you for reaching out. Your message has been sent successfully, and I'll get back to you as soon as
                possible.
              </p>
              <button
                onClick={() => { setForm({ name: "", email: "", phone: "", country: "", subject: "", inquiryType: INQUIRY_TYPES[0], message: "", website: "" }); setState("idle"); }}
                className="mt-8 rounded-full border border-line px-6 py-3 text-sm font-semibold text-chrome transition hover:border-chrome"
              >
                Send another message
              </button>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* ---------- FORM ---------- */}
            <Reveal>
              <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-line bg-ink-2/50 p-6 sm:grid-cols-2 sm:p-8">
                {/* honeypot */}
                <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden />

                <div className="sm:col-span-2">
                  <label className={label}>Inquiry Type</label>
                  <select className={field} value={form.inquiryType} onChange={(e) => set("inquiryType", e.target.value)}>
                    {INQUIRY_TYPES.map((t) => <option key={t} value={t} className="bg-ink-3">{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className={label}>Full Name *</label>
                  <input className={field} placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Email Address *</label>
                  <input className={field} type="email" placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Phone Number</label>
                  <input className={field} placeholder="Optional" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label className={label}>Country</label>
                  <input className={field} placeholder="Where are you based?" value={form.country} onChange={(e) => set("country", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Subject</label>
                  <input className={field} placeholder="What's this about?" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Message</label>
                  <textarea className={field} rows={6} placeholder="Tell me more…" value={form.message} onChange={(e) => set("message", e.target.value)} />
                </div>

                {err && <p className="text-sm text-red sm:col-span-2">{err}</p>}
                <button
                  disabled={state === "sending"}
                  className="rounded-full bg-chrome px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-60 sm:col-span-2"
                >
                  {state === "sending" ? "Sending…" : "Send Message"}
                </button>
              </form>
            </Reveal>

            {/* ---------- SIDEBAR: socials + business contact ---------- */}
            <Reveal delay={120}>
              <div className="space-y-6">
                {socials.length > 0 && (
                  <div className="rounded-3xl border border-line bg-ink-2/50 p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-fog">Follow &amp; Listen</p>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      {socials.map((s) => (
                        <a key={s.key} href={settings![s.key]} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-line px-3 py-3 text-sm font-semibold text-chrome transition hover:border-chrome hover:bg-ink-3">
                          <PlatformIcon name={s.label} className="h-4 w-4 shrink-0" /> {s.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {hasBusiness && (
                  <div className="rounded-3xl border border-line bg-ink-2/50 p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-fog">Business Contact</p>
                    <ul className="mt-4 space-y-4 text-sm">
                      {settings?.bookingEmail && (
                        <li>
                          <p className="text-xs uppercase tracking-widest text-fog/70">General</p>
                          <a href={`mailto:${settings.bookingEmail}`} className="text-chrome transition hover:text-blue">{settings.bookingEmail}</a>
                        </li>
                      )}
                      {settings?.managementEmail && (
                        <li>
                          <p className="text-xs uppercase tracking-widest text-fog/70">Management{settings.managementName ? ` · ${settings.managementName}` : ""}</p>
                          <a href={`mailto:${settings.managementEmail}`} className="text-chrome transition hover:text-blue">{settings.managementEmail}</a>
                        </li>
                      )}
                      {settings?.bookingAgentEmail && (
                        <li>
                          <p className="text-xs uppercase tracking-widest text-fog/70">Booking Agent{settings.bookingAgentName ? ` · ${settings.bookingAgentName}` : ""}</p>
                          <a href={`mailto:${settings.bookingAgentEmail}`} className="text-chrome transition hover:text-blue">{settings.bookingAgentEmail}</a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="rounded-3xl border border-line bg-gradient-to-br from-blue/10 to-purple/10 p-6">
                  <p className="text-sm leading-relaxed text-fog">
                    Every message reaches MXK directly. For time-sensitive bookings, mention your event date in the
                    message and I'll prioritize it.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}
