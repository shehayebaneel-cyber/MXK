import { useEffect, useState } from "react";
import { api, formatDate } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import { PageTitle } from "./ui";

type Message = {
  id: number; name: string; email: string; phone: string; country: string;
  subject: string; inquiryType: string; message: string; read: boolean; archived: boolean; createdAt: string;
};

const INQUIRY_TYPES = [
  "General Inquiry", "Live Performance", "DJ Booking", "Studio Production",
  "Collaboration", "Remix Request", "Press / Media", "Brand Partnership", "Other",
];

const pill = (active: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? "bg-chrome text-ink" : "border border-line text-fog hover:text-chrome"}`;

export function AdminContactMessages() {
  useMeta("Contact Messages — MXK Admin");
  const [items, setItems] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [box, setBox] = useState<"inbox" | "archived">("inbox");
  const [readFilter, setReadFilter] = useState<"" | "unread" | "read">("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  function load() {
    const params = new URLSearchParams();
    params.set("box", box);
    if (readFilter) params.set("read", readFilter);
    if (type) params.set("type", type);
    if (q.trim()) params.set("q", q.trim());
    api.get<{ messages: Message[]; unread: number }>(`/api/contact?${params.toString()}`)
      .then((d) => { setItems(d.messages); setUnread(d.unread); })
      .catch(() => {});
  }
  // Debounce search; reload immediately on the other filters.
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [box, readFilter, type, q]); // eslint-disable-line react-hooks/exhaustive-deps

  async function patch(m: Message, data: Partial<Pick<Message, "read" | "archived">>) {
    await api.patch(`/api/contact/${m.id}`, data);
    load();
  }
  async function remove(m: Message) {
    if (!confirm(`Delete this message from ${m.name}? This can't be undone.`)) return;
    await api.delete(`/api/contact/${m.id}`);
    if (open === m.id) setOpen(null);
    load();
  }
  function toggleOpen(m: Message) {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next !== null && !m.read) patch(m, { read: true }); // opening marks read
  }

  return (
    <div>
      <PageTitle title="Contact Messages" action={unread > 0 ? <span className="rounded-full bg-blue px-3 py-1.5 text-sm font-bold text-white">{unread} unread</span> : undefined} />

      {/* Box + read filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setBox("inbox")} className={pill(box === "inbox")}>Inbox</button>
        <button onClick={() => setBox("archived")} className={pill(box === "archived")}>Archived</button>
        <span className="mx-1 h-5 w-px bg-line" />
        {([["", "All"], ["unread", "Unread"], ["read", "Read"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setReadFilter(k)} className={pill(readFilter === k)}>{l}</button>
        ))}
      </div>

      {/* Type filter + search */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-line bg-ink-3 px-3 py-2 text-sm text-chrome outline-none focus:border-blue">
          <option value="" className="bg-ink-3">All inquiry types</option>
          {INQUIRY_TYPES.map((t) => <option key={t} value={t} className="bg-ink-3">{t}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, subject, message…"
          className="flex-1 rounded-xl border border-line bg-ink-3 px-3 py-2 text-sm text-chrome placeholder:text-fog/60 outline-none focus:border-blue" />
      </div>

      <div className="space-y-2">
        {items.map((m) => (
          <div key={m.id} className={`rounded-xl border bg-ink-2 p-4 transition ${!m.read ? "border-blue/50" : "border-line"}`}>
            <button onClick={() => toggleOpen(m)} className="flex w-full items-center justify-between gap-3 text-left">
              <div className="flex min-w-0 items-center gap-3">
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue" aria-label="Unread" />}
                <div className="min-w-0">
                  <p className={`truncate ${m.read ? "font-medium text-fog" : "font-semibold text-chrome"}`}>
                    {m.name}
                    <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue">{m.inquiryType}</span>
                  </p>
                  <p className="truncate text-xs text-fog">{[m.subject, formatDate(m.createdAt)].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <span className="shrink-0 text-fog">{open === m.id ? "▲" : "▼"}</span>
            </button>

            {open === m.id && (
              <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm text-fog">
                <p><span className="text-chrome">Email:</span> <a href={`mailto:${m.email}`} className="text-blue underline">{m.email}</a></p>
                {m.phone && <p><span className="text-chrome">Phone:</span> {m.phone}</p>}
                {m.country && <p><span className="text-chrome">Country:</span> {m.country}</p>}
                {m.subject && <p><span className="text-chrome">Subject:</span> {m.subject}</p>}
                {m.message && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-ink-3 p-3 text-chrome">{m.message}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || m.inquiryType))}`} className="rounded-full bg-chrome px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white">Reply</a>
                  <button onClick={() => patch(m, { read: !m.read })} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-chrome hover:border-blue">Mark {m.read ? "unread" : "read"}</button>
                  <button onClick={() => patch(m, { archived: !m.archived })} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-chrome hover:border-blue">{m.archived ? "Unarchive" : "Archive"}</button>
                  <button onClick={() => remove(m)} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-red hover:border-red">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-fog">No messages{box === "archived" ? " archived" : ""}{type ? ` for ${type}` : ""}{q ? ` matching "${q}"` : ""}.</p>
        )}
      </div>
    </div>
  );
}
