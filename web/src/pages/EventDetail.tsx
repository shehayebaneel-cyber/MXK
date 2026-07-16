import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, formatDate, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { MXKEvent } from "../types";

const field = "w-full rounded-lg border border-line bg-ink-3 px-4 py-3 text-sm text-chrome outline-none focus:border-blue placeholder:text-fog/50";
const priceLabel = (e: MXKEvent) => (e.ticketPrice > 0 ? `$${e.ticketPrice.toFixed(0)} / ticket` : "Free entry · RSVP");

function TicketModal({ event, onClose }: { event: MXKEvent; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", quantity: 1, website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ reference: string; quantity: number } | null>(null);
  const soldOut = event.ticketsLeft === 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErr("Name and email are required.");
      return;
    }
    setState("sending");
    setErr("");
    try {
      const r = await api.post<{ checkout?: boolean; url?: string; reference?: string; quantity?: number }>(`/api/events/${event.slug}/tickets`, form);
      if (r.checkout && r.url) {
        window.location.href = r.url;
        return;
      } // → Stripe Checkout
      setDone({ reference: r.reference!, quantity: r.quantity! });
      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't reserve.");
      setState("error");
    }
  }
  const payOnline = !!event.paymentsOnline;

  return (
    <div className="bg-ink/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="border-line bg-ink-2 w-full max-w-md rounded-2xl border p-6" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center">
            <p className="display text-chrome text-3xl">You're on the list 🎟</p>
            <p className="text-fog mt-3">
              {done.quantity} ticket{done.quantity > 1 ? "s" : ""} reserved for <b className="text-chrome">{event.title}</b>.
            </p>
            <p className="bg-ink-3 text-fog mt-4 rounded-lg px-4 py-3 text-sm">
              Your reference
              <br />
              <span className="display text-blue text-2xl">{done.reference}</span>
            </p>
            <p className="text-fog mt-3 text-xs">
              Show this reference at the door{event.ticketPrice > 0 ? ` — ${priceLabel(event)}, pay on entry` : ""}. A copy has been logged for MXK's team.
            </p>
            <button onClick={onClose} className="bg-chrome text-ink mt-5 w-full rounded-full px-6 py-3 text-sm font-semibold">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="display text-chrome text-2xl">Reserve tickets</h2>
                <p className="text-fog mt-1 text-sm">
                  {event.title} · {formatDate(event.date)}
                </p>
                <p className="text-blue mt-1 text-sm font-semibold">
                  {priceLabel(event)}
                  {event.ticketNote ? ` · ${event.ticketNote}` : ""}
                </p>
                {event.ticketsLeft != null && !soldOut && <p className="text-fog text-xs">{event.ticketsLeft} left</p>}
              </div>
              <button onClick={onClose} className="text-fog hover:text-chrome">
                ✕
              </button>
            </div>
            {soldOut ? (
              <p className="bg-red/10 text-red mt-6 rounded-lg px-4 py-3 text-center font-semibold">Sold out</p>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input
                  type="text"
                  tabIndex={-1}
                  className="hidden"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  aria-hidden
                />
                <input className={field} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className={field} placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <label className="text-fog flex items-center justify-between gap-3 text-sm">
                  How many tickets?
                  <select className={`${field} w-24`} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}>
                    {Array.from({ length: Math.min(10, event.ticketsLeft ?? 10) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-ink-3">
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                {err && <p className="text-red text-sm">{err}</p>}
                <button
                  disabled={state === "sending"}
                  className="bg-chrome text-ink w-full rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-white disabled:opacity-60"
                >
                  {state === "sending"
                    ? payOnline
                      ? "Redirecting to payment…"
                      : "Reserving…"
                    : payOnline
                      ? `Pay $${(event.ticketPrice * form.quantity).toFixed(0)} · ${form.quantity} ticket${form.quantity > 1 ? "s" : ""}`
                      : `Reserve ${form.quantity} ticket${form.quantity > 1 ? "s" : ""}`}
                </button>
                <p className="text-fog text-center text-xs">
                  {payOnline ? "Secure card payment via Stripe." : `No payment now — reserve your spot${event.ticketPrice > 0 ? " and pay at the door" : ""}.`}
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function EventDetail() {
  const { slug } = useParams();
  const [e, setE] = useState<MXKEvent | null>(null);
  const [missing, setMissing] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [tickets, setTickets] = useState(false);
  const [params, setParams] = useSearchParams();
  const [paid, setPaid] = useState<{ reference: string; quantity: number; title: string } | null>(null);
  const canceled = params.get("ticket_canceled") === "1";

  useEffect(() => {
    if (!slug) return;
    setE(null);
    setMissing(false);
    api
      .get<MXKEvent>(`/api/events/${slug}`)
      .then(setE)
      .catch(() => setMissing(true));
  }, [slug]);

  // Returning from Stripe Checkout: verify the payment and confirm the ticket.
  useEffect(() => {
    const sid = params.get("session_id");
    if (!sid) return;
    api
      .post<{ paid: boolean; reference?: string; quantity?: number; title?: string }>("/api/stripe/confirm", { sessionId: sid })
      .then((r) => {
        if (r.paid) setPaid({ reference: r.reference!, quantity: r.quantity!, title: r.title! });
      })
      .catch(() => {})
      .finally(() => {
        params.delete("session_id");
        setParams(params, { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useMeta(e ? `${e.title} — MXK Live` : "MXK Live", e?.description || undefined);

  if (missing)
    return (
      <div className="text-fog px-6 pt-40 text-center">
        Event not found.{" "}
        <Link to="/live" className="text-chrome underline">
          Back to Live
        </Link>
      </div>
    );
  if (!e) return <div className="text-fog pt-40 text-center">Loading…</div>;

  const upcoming = new Date(e.date) >= new Date();
  const canReserve = e.ticketsEnabled && upcoming;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-28 sm:pt-32">
      <Link to="/live" className="text-fog hover:text-chrome text-sm transition">
        ← Live
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        {mediaUrl(e.poster) && (
          <div className="border-line bg-ink-3 overflow-hidden rounded-3xl border">
            <img src={mediaUrl(e.poster)} alt={e.title} className="w-full object-cover" />
          </div>
        )}
        <div>
          <p className="text-blue text-sm uppercase tracking-[0.3em]">{formatDate(e.date)}</p>
          <h1 className="display text-chrome mt-2 text-5xl sm:text-6xl">{e.title}</h1>
          <p className="text-fog mt-2 text-lg">{[e.venue, e.city].filter(Boolean).join(" · ")}</p>
          {e.description && <p className="text-fog mt-5 max-w-xl leading-relaxed">{e.description}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canReserve ? (
              e.ticketsLeft === 0 ? (
                <span className="border-line text-red rounded-full border px-8 py-3.5 text-sm font-semibold">Sold out</span>
              ) : (
                <button
                  onClick={() => setTickets(true)}
                  className="bg-chrome text-ink rounded-full px-8 py-3.5 text-sm font-semibold transition hover:bg-white"
                >
                  Get Tickets
                </button>
              )
            ) : e.ticketUrl ? (
              <a
                href={e.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-chrome text-ink rounded-full px-8 py-3.5 text-sm font-semibold transition hover:bg-white"
              >
                Get Tickets ↗
              </a>
            ) : null}
            {canReserve && (
              <span className="text-fog text-sm">
                {priceLabel(e)}
                {e.ticketsLeft != null ? ` · ${e.ticketsLeft} left` : ""}
              </span>
            )}
          </div>

          {e.tracklist && (
            <div className="mt-8">
              <h2 className="text-fog text-xs font-bold uppercase tracking-widest">Tracklist</h2>
              <ol className="text-fog mt-3 space-y-1 text-sm">
                {e.tracklist
                  .split("\n")
                  .filter(Boolean)
                  .map((t, i) => (
                    <li key={i}>
                      <span className="text-chrome/40">{String(i + 1).padStart(2, "0")}</span> {t}
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {e.photos.length > 0 && (
        <div className="mt-14">
          <h2 className="display text-chrome text-3xl">Gallery</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {e.photos.map((src, i) => (
              <button key={i} onClick={() => setLightbox(mediaUrl(src))} className="border-line bg-ink-3 aspect-square overflow-hidden rounded-xl border">
                <img src={mediaUrl(src)} alt="" loading="lazy" className="h-full w-full object-cover transition hover:scale-105" />
              </button>
            ))}
          </div>
        </div>
      )}

      {e.videos.length > 0 && (
        <div className="mt-12 space-y-4">
          {e.videos.map((v, i) => (
            <div key={i} className="border-line aspect-video overflow-hidden rounded-2xl border">
              <iframe src={v} title={`video-${i}`} className="h-full w-full" allowFullScreen />
            </div>
          ))}
        </div>
      )}

      {canceled && !paid && (
        <p className="border-line bg-ink-2 text-fog mt-6 rounded-xl border px-4 py-3 text-sm">Payment canceled — you can try again anytime.</p>
      )}

      {paid && (
        <div className="bg-ink/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPaid(null)}>
          <div className="border-line bg-ink-2 w-full max-w-md rounded-2xl border p-6 text-center" onClick={(ev) => ev.stopPropagation()}>
            <p className="display text-chrome text-3xl">Payment successful 🎟</p>
            <p className="text-fog mt-3">
              {paid.quantity} ticket{paid.quantity > 1 ? "s" : ""} confirmed for <b className="text-chrome">{paid.title}</b>.
            </p>
            <p className="bg-ink-3 text-fog mt-4 rounded-lg px-4 py-3 text-sm">
              Your reference
              <br />
              <span className="display text-blue text-2xl">{paid.reference}</span>
            </p>
            <p className="text-fog mt-3 text-xs">A receipt was emailed by Stripe. Show this reference at the door.</p>
            <button onClick={() => setPaid(null)} className="bg-chrome text-ink mt-5 w-full rounded-full px-6 py-3 text-sm font-semibold">
              Done
            </button>
          </div>
        </div>
      )}

      {tickets && <TicketModal event={e} onClose={() => setTickets(false)} />}
      {lightbox && (
        <div className="bg-ink/95 fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-[92vh] max-w-full rounded-lg object-contain" />
          <button className="text-chrome absolute right-5 top-5 text-2xl">✕</button>
        </div>
      )}
    </div>
  );
}
