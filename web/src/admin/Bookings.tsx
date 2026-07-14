import { useEffect, useState } from "react";
import { api, formatDate } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import { PageTitle } from "./ui";

type Booking = {
  id: number; name: string; email: string; company: string; country: string; venue: string;
  eventDate: string; bookingType: string; budget: string; message: string; status: string; createdAt: string;
};
const STATUSES = ["NEW", "CONTACTED", "ARCHIVED"];
const COLOR: Record<string, string> = { NEW: "text-blue", CONTACTED: "text-chrome", ARCHIVED: "text-fog" };

export function AdminBookings() {
  useMeta("Bookings — MXK Admin");
  const [items, setItems] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const load = () => api.get<Booking[]>(`/api/bookings${filter ? `?status=${filter}` : ""}`).then(setItems).catch(() => {});
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(b: Booking, status: string) { await api.patch(`/api/bookings/${b.id}`, { status }); await load(); }

  return (
    <div>
      <PageTitle title="Bookings" />
      <div className="mb-4 flex gap-2">
        {[["", "All"], ...STATUSES.map((s) => [s, s[0] + s.slice(1).toLowerCase()])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === k ? "bg-chrome text-ink" : "border border-line text-fog"}`}>{l}</button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((b) => (
          <div key={b.id} className="rounded-xl border border-line bg-ink-2 p-4">
            <button onClick={() => setOpen(open === b.id ? null : b.id)} className="flex w-full items-center justify-between gap-3 text-left">
              <div className="min-w-0">
                <p className="truncate font-semibold text-chrome">{b.name} <span className={`ml-2 text-xs font-bold ${COLOR[b.status]}`}>{b.status}</span></p>
                <p className="truncate text-xs text-fog">{b.bookingType} · {[b.venue, b.country].filter(Boolean).join(", ")} · {formatDate(b.createdAt)}</p>
              </div>
              <span className="text-fog">{open === b.id ? "▲" : "▼"}</span>
            </button>
            {open === b.id && (
              <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-fog">
                <p><span className="text-chrome">Email:</span> <a href={`mailto:${b.email}`} className="text-blue underline">{b.email}</a></p>
                {b.company && <p><span className="text-chrome">Company:</span> {b.company}</p>}
                {b.eventDate && <p><span className="text-chrome">Event date:</span> {b.eventDate}</p>}
                {b.budget && <p><span className="text-chrome">Budget:</span> {b.budget}</p>}
                {b.message && <p className="mt-2 rounded-lg bg-ink-3 p-3 text-chrome">{b.message}</p>}
                <div className="mt-3 flex gap-2">
                  {STATUSES.filter((s) => s !== b.status).map((s) => (
                    <button key={s} onClick={() => setStatus(b, s)} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-chrome hover:border-blue">Mark {s.toLowerCase()}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-fog">No booking requests{filter ? ` (${filter.toLowerCase()})` : ""}.</p>}
      </div>
    </div>
  );
}
