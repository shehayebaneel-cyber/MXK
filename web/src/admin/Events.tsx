import { useEffect, useState } from "react";
import { ImageField } from "../components/ImageField";
import { api, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { MXKEvent } from "../types";
import { Field, PageTitle, btnGhost, btnPrimary, inputCls } from "./ui";

const asDate = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
type Draft = Partial<MXKEvent> & { date?: string };
const blank: Draft = { title: "", venue: "", city: "", date: asDate(new Date().toISOString()), description: "", ticketUrl: "", tracklist: "", poster: "", photos: [], videos: [], ticketsEnabled: false, ticketPrice: 0, ticketCapacity: 0, ticketNote: "" };

export function AdminEvents() {
  useMeta("Live — MXK Admin");
  const [list, setList] = useState<MXKEvent[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get<{ upcoming: MXKEvent[]; past: MXKEvent[] }>("/api/events?all=1").then((d) => setList([...d.upcoming, ...d.past])).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k: keyof Draft, v: unknown) => setDraft((d) => ({ ...d!, [k]: v }));

  async function save() {
    if (!draft?.title) return;
    setBusy(true);
    try {
      if (draft.id) await api.patch(`/api/events/${draft.id}`, draft);
      else await api.post("/api/events", draft);
      setDraft(null); await load();
    } finally { setBusy(false); }
  }
  async function remove(e: MXKEvent) { if (confirm(`Delete "${e.title}"?`)) { await api.delete(`/api/events/${e.id}`); await load(); } }

  return (
    <div>
      <PageTitle title="Live" action={<button onClick={() => setDraft({ ...blank })} className={btnPrimary}>+ New show</button>} />

      {draft && (
        <div className="mb-8 rounded-2xl border border-line bg-ink-2 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><input className={inputCls} value={draft.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Date"><input type="date" className={inputCls} value={asDate(draft.date)} onChange={(e) => set("date", e.target.value)} /></Field>
            <Field label="Venue"><input className={inputCls} value={draft.venue ?? ""} onChange={(e) => set("venue", e.target.value)} /></Field>
            <Field label="City"><input className={inputCls} value={draft.city ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Ticket URL"><input className={inputCls} value={draft.ticketUrl ?? ""} onChange={(e) => set("ticketUrl", e.target.value)} /></Field>
            <div className="sm:col-span-2"><ImageField label="Poster" value={draft.poster ?? ""} onChange={(v) => set("poster", v)} /></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea className={inputCls} rows={3} value={draft.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Tracklist (one per line)"><textarea className={inputCls} rows={3} value={draft.tracklist ?? ""} onChange={(e) => set("tracklist", e.target.value)} /></Field></div>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-fog">Photos</span>
              <div className="mb-2 flex flex-wrap gap-2">
                {(draft.photos ?? []).map((p, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
                    <img src={mediaUrl(p)} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => set("photos", (draft.photos ?? []).filter((_, j) => j !== i))} className="absolute right-0 top-0 bg-ink/80 px-1 text-xs text-red">✕</button>
                  </div>
                ))}
              </div>
              <ImageField value="" onChange={(v) => v && set("photos", [...(draft.photos ?? []), v])} />
            </div>
            <div className="sm:col-span-2"><Field label="Video embed URLs (one per line)"><textarea className={inputCls} rows={2} placeholder="https://www.youtube.com/embed/…" value={(draft.videos ?? []).join("\n")} onChange={(e) => set("videos", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} /></Field></div>

            {/* On-site tickets */}
            <div className="rounded-xl border border-line bg-ink-3/40 p-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-chrome">
                <input type="checkbox" checked={!!draft.ticketsEnabled} onChange={(e) => set("ticketsEnabled", e.target.checked)} />
                Sell / reserve tickets on this site
              </label>
              {draft.ticketsEnabled && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Price ($, 0 = free)"><input type="number" min={0} className={inputCls} value={draft.ticketPrice ?? 0} onChange={(e) => set("ticketPrice", Number(e.target.value) || 0)} /></Field>
                  <Field label="Capacity (0 = unlimited)"><input type="number" min={0} className={inputCls} value={draft.ticketCapacity ?? 0} onChange={(e) => set("ticketCapacity", Number(e.target.value) || 0)} /></Field>
                  <Field label="Note (e.g. pay at door)"><input className={inputCls} value={draft.ticketNote ?? ""} onChange={(e) => set("ticketNote", e.target.value)} /></Field>
                </div>
              )}
              {!draft.ticketsEnabled && <p className="mt-2 text-xs text-fog">Off — fans use the external Ticket URL above (if set). Turn on to let fans reserve directly on the site.</p>}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Save"}</button>
            <button onClick={() => setDraft(null)} className={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-xl border border-line bg-ink-2 p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-3">{e.poster ? <img src={mediaUrl(e.poster)} alt="" className="h-full w-full object-cover" /> : null}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-chrome">{e.title}</p>
              <p className="truncate text-xs text-fog">{asDate(e.date)} · {[e.venue, e.city].filter(Boolean).join(", ")}</p>
            </div>
            <button onClick={() => setDraft({ ...e, date: asDate(e.date) })} className={btnGhost}>Edit</button>
            <button onClick={() => remove(e)} className="rounded-full px-3 py-2 text-sm text-red hover:bg-red/10">Delete</button>
          </div>
        ))}
        {list.length === 0 && <p className="text-fog">No shows yet.</p>}
      </div>
    </div>
  );
}
