import { useEffect, useState } from "react";
import { api, formatDate } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import { PageTitle } from "./ui";

type Message = {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  inquiryType: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
};

const INQUIRY_TYPES = [
  "General Inquiry",
  "Live Performance",
  "DJ Booking",
  "Studio Production",
  "Collaboration",
  "Remix Request",
  "Press / Media",
  "Brand Partnership",
  "Other",
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
    api
      .get<{ messages: Message[]; unread: number }>(`/api/contact?${params.toString()}`)
      .then((d) => {
        setItems(d.messages);
        setUnread(d.unread);
      })
      .catch(() => {});
  }
  // Debounce search; reload immediately on the other filters.
  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [box, readFilter, type, q]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <PageTitle
        title="Contact Messages"
        action={unread > 0 ? <span className="bg-blue rounded-full px-3 py-1.5 text-sm font-bold text-white">{unread} unread</span> : undefined}
      />

      {/* Box + read filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setBox("inbox")} className={pill(box === "inbox")}>
          Inbox
        </button>
        <button onClick={() => setBox("archived")} className={pill(box === "archived")}>
          Archived
        </button>
        <span className="bg-line mx-1 h-5 w-px" />
        {(
          [
            ["", "All"],
            ["unread", "Unread"],
            ["read", "Read"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setReadFilter(k)} className={pill(readFilter === k)}>
            {l}
          </button>
        ))}
      </div>

      {/* Type filter + search */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border-line bg-ink-3 text-chrome focus:border-blue rounded-xl border px-3 py-2 text-sm outline-none"
        >
          <option value="" className="bg-ink-3">
            All inquiry types
          </option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t} className="bg-ink-3">
              {t}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, subject, message…"
          className="border-line bg-ink-3 text-chrome placeholder:text-fog/60 focus:border-blue flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="space-y-2">
        {items.map((m) => (
          <div key={m.id} className={`bg-ink-2 rounded-xl border p-4 transition ${!m.read ? "border-blue/50" : "border-line"}`}>
            <button onClick={() => toggleOpen(m)} className="flex w-full items-center justify-between gap-3 text-left">
              <div className="flex min-w-0 items-center gap-3">
                {!m.read && <span className="bg-blue h-2 w-2 shrink-0 rounded-full" aria-label="Unread" />}
                <div className="min-w-0">
                  <p className={`truncate ${m.read ? "text-fog font-medium" : "text-chrome font-semibold"}`}>
                    {m.name}
                    <span className="border-line text-blue ml-2 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {m.inquiryType}
                    </span>
                  </p>
                  <p className="text-fog truncate text-xs">{[m.subject, formatDate(m.createdAt)].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <span className="text-fog shrink-0">{open === m.id ? "▲" : "▼"}</span>
            </button>

            {open === m.id && (
              <div className="border-line text-fog mt-3 space-y-1.5 border-t pt-3 text-sm">
                <p>
                  <span className="text-chrome">Email:</span>{" "}
                  <a href={`mailto:${m.email}`} className="text-blue underline">
                    {m.email}
                  </a>
                </p>
                {m.phone && (
                  <p>
                    <span className="text-chrome">Phone:</span> {m.phone}
                  </p>
                )}
                {m.country && (
                  <p>
                    <span className="text-chrome">Country:</span> {m.country}
                  </p>
                )}
                {m.subject && (
                  <p>
                    <span className="text-chrome">Subject:</span> {m.subject}
                  </p>
                )}
                {m.message && <p className="bg-ink-3 text-chrome mt-2 whitespace-pre-wrap rounded-lg p-3">{m.message}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || m.inquiryType))}`}
                    className="bg-chrome text-ink rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-white"
                  >
                    Reply
                  </a>
                  <button
                    onClick={() => patch(m, { read: !m.read })}
                    className="border-line text-chrome hover:border-blue rounded-full border px-3 py-1.5 text-xs font-semibold"
                  >
                    Mark {m.read ? "unread" : "read"}
                  </button>
                  <button
                    onClick={() => patch(m, { archived: !m.archived })}
                    className="border-line text-chrome hover:border-blue rounded-full border px-3 py-1.5 text-xs font-semibold"
                  >
                    {m.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button onClick={() => remove(m)} className="border-line text-red hover:border-red rounded-full border px-3 py-1.5 text-xs font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-fog">
            No messages{box === "archived" ? " archived" : ""}
            {type ? ` for ${type}` : ""}
            {q ? ` matching "${q}"` : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
