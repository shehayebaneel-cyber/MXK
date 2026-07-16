import { useEffect, useState } from "react";
import { ImageField } from "../components/ImageField";
import { api, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { ArchiveItem } from "../types";
import { Field, PageTitle, btnGhost, btnPrimary, inputCls } from "./ui";

const CATS = ["LIVE", "STUDIO", "BTS"];
type Draft = { type: "PHOTO" | "VIDEO"; category: string; url: string; thumbnail: string; caption: string };
const blank: Draft = { type: "PHOTO", category: "LIVE", url: "", thumbnail: "", caption: "" };

export function AdminArchive() {
  useMeta("Archive — MXK Admin");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get<ArchiveItem[]>("/api/archive")
      .then(setItems)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);
  const set = (k: keyof Draft, v: string) => setDraft((d) => ({ ...d!, [k]: v }));

  async function save() {
    if (!draft?.url) return;
    setBusy(true);
    try {
      await api.post("/api/archive", draft);
      setDraft(null);
      await load();
    } finally {
      setBusy(false);
    }
  }
  async function remove(i: ArchiveItem) {
    if (confirm("Delete this media?")) {
      await api.delete(`/api/archive/${i.id}`);
      await load();
    }
  }

  return (
    <div>
      <PageTitle
        title="Archive"
        action={
          <button onClick={() => setDraft({ ...blank })} className={btnPrimary}>
            + Add media
          </button>
        }
      />

      {draft && (
        <div className="border-line bg-ink-2 mb-8 rounded-2xl border p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select className={inputCls} value={draft.type} onChange={(e) => set("type", e.target.value)}>
                <option value="PHOTO" className="bg-ink-3">
                  Photo
                </option>
                <option value="VIDEO" className="bg-ink-3">
                  Video
                </option>
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={draft.category} onChange={(e) => set("category", e.target.value)}>
                {CATS.map((c) => (
                  <option key={c} value={c} className="bg-ink-3">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            {draft.type === "PHOTO" ? (
              <div className="sm:col-span-2">
                <ImageField label="Photo" value={draft.url} onChange={(v) => set("url", v)} />
              </div>
            ) : (
              <>
                <div className="sm:col-span-2">
                  <Field label="Video embed URL">
                    <input className={inputCls} placeholder="https://www.youtube.com/embed/…" value={draft.url} onChange={(e) => set("url", e.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <ImageField label="Thumbnail (optional)" value={draft.thumbnail} onChange={(v) => set("thumbnail", v)} />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <Field label="Caption">
                <input className={inputCls} value={draft.caption} onChange={(e) => set("caption", e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={busy} className={btnPrimary}>
              {busy ? "Saving…" : "Add"}
            </button>
            <button onClick={() => setDraft(null)} className={btnGhost}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.id} className="border-line bg-ink-2 group relative overflow-hidden rounded-xl border">
            <img src={mediaUrl(i.thumbnail || i.url)} alt="" className="aspect-square w-full object-cover" />
            <div className="bg-ink/80 text-fog absolute inset-x-0 bottom-0 flex items-center justify-between px-2 py-1 text-[10px]">
              <span>
                {i.category} · {i.type}
              </span>
              <button onClick={() => remove(i)} className="text-red">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-fog">No media yet.</p>}
      </div>
    </div>
  );
}
