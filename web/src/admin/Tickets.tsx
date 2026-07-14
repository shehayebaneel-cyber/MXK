import { useEffect, useState } from "react";
import { api, formatDate } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { TicketRequest } from "../types";
import { PageTitle } from "./ui";

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"];
const COLOR: Record<string, string> = { PENDING: "text-blue", CONFIRMED: "text-[#39d98a]", CANCELLED: "text-fog line-through" };

export function AdminTickets() {
  useMeta("Tickets — MXK Admin");
  const [items, setItems] = useState<TicketRequest[]>([]);
  const [filter, setFilter] = useState("");

  const load = () => api.get<TicketRequest[]>(`/api/tickets${filter ? `?status=${filter}` : ""}`).then(setItems).catch(() => {});
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(t: TicketRequest, status: string) { await api.patch(`/api/tickets/${t.id}`, { status }); await load(); }

  const totalTickets = items.filter((t) => t.status !== "CANCELLED").reduce((n, t) => n + t.quantity, 0);

  return (
    <div>
      <PageTitle title="Tickets" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[["", "All"], ...STATUSES.map((s) => [s, s[0] + s.slice(1).toLowerCase()])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === k ? "bg-chrome text-ink" : "border border-line text-fog"}`}>{l}</button>
        ))}
        <span className="ml-auto text-sm text-fog">{totalTickets} ticket{totalTickets === 1 ? "" : "s"} reserved</span>
      </div>

      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ink-2 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-chrome">
                {t.name} · {t.quantity}× <span className="text-fog">→ {t.eventTitle}</span>
                <span className={`ml-2 text-xs font-bold ${COLOR[t.status]}`}>{t.status}</span>
                {t.paid && <span className="ml-2 rounded bg-[#39d98a]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#39d98a]">PAID ${t.amountPaid.toFixed(0)}</span>}
              </p>
              <p className="truncate text-xs text-fog">
                <span className="text-blue">{t.reference}</span> · <a href={`mailto:${t.email}`} className="underline hover:text-chrome">{t.email}</a>
                {t.phone ? ` · ${t.phone}` : ""} · {formatDate(t.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              {t.status !== "CONFIRMED" && <button onClick={() => setStatus(t, "CONFIRMED")} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-[#39d98a] hover:border-[#39d98a]">Confirm</button>}
              {t.status !== "CANCELLED" && <button onClick={() => setStatus(t, "CANCELLED")} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-red hover:border-red">Cancel</button>}
              {t.status === "CANCELLED" && <button onClick={() => setStatus(t, "PENDING")} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-fog">Restore</button>}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-fog">No ticket reservations{filter ? ` (${filter.toLowerCase()})` : ""} yet.</p>}
      </div>
    </div>
  );
}
