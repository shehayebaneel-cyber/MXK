import { useState } from "react";
import { api } from "../lib/api";
import { useMeta } from "../lib/useMeta";

const TYPES = ["DJ Set", "Live Drummer", "Music Production", "Remix", "Collaboration", "Festival", "Private Event"];

const field = "w-full rounded-xl border border-line bg-ink-3 px-4 py-3 text-sm text-chrome placeholder:text-fog/60 outline-none transition focus:border-blue";

export function Booking() {
  useMeta("Book MXK", "Book MXK for a DJ set, live drums, production, a remix, a festival or a private event.");
  const [form, setForm] = useState({ name: "", email: "", company: "", country: "", venue: "", eventDate: "", bookingType: TYPES[0], budget: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setErr("Name and email are required."); return; }
    setState("sending"); setErr("");
    try {
      await api.post("/api/bookings", form);
      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't send. Try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 pt-20 text-center">
        <h1 className="display text-5xl text-chrome">Request Sent</h1>
        <p className="mt-4 text-fog">Thanks — your booking request reached MXK's team. You'll hear back by email soon.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-28 pt-28 sm:pt-32">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue">Booking</p>
      <h1 className="display mt-3 text-5xl text-chrome sm:text-6xl">Book MXK</h1>
      <p className="mt-4 max-w-xl text-fog">DJ sets, live drums, production, remixes, festivals and private events. Tell us about yours.</p>

      <form onSubmit={submit} className="mt-10 grid gap-4 sm:grid-cols-2">
        {/* honeypot */}
        <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden />
        <input className={field} placeholder="Name *" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input className={field} placeholder="Email *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input className={field} placeholder="Company / Promoter" value={form.company} onChange={(e) => set("company", e.target.value)} />
        <input className={field} placeholder="Country" value={form.country} onChange={(e) => set("country", e.target.value)} />
        <input className={field} placeholder="Venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
        <input className={field} placeholder="Event date" type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
        <select className={field} value={form.bookingType} onChange={(e) => set("bookingType", e.target.value)}>
          {TYPES.map((t) => <option key={t} value={t} className="bg-ink-3">{t}</option>)}
        </select>
        <input className={field} placeholder="Budget (optional)" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
        <textarea className={`${field} sm:col-span-2`} rows={5} placeholder="Message — tell us about the event" value={form.message} onChange={(e) => set("message", e.target.value)} />
        {err && <p className="text-sm text-red sm:col-span-2">{err}</p>}
        <button disabled={state === "sending"} className="rounded-full bg-chrome px-8 py-3.5 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-60 sm:col-span-2">
          {state === "sending" ? "Sending…" : "Send Booking Request"}
        </button>
      </form>
    </div>
  );
}
