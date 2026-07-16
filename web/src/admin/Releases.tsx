import { useEffect, useState } from "react";
import { AudioField } from "../components/AudioField";
import { ImageField } from "../components/ImageField";
import { api, mediaUrl } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { Release } from "../types";
import { Field, PageTitle, btnGhost, btnPrimary, inputCls } from "./ui";

const TYPES = ["SINGLE", "ALBUM", "REMIX", "COLLAB", "ARABIC_HOUSE"];
const asDate = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
type Draft = Partial<Release> & { releaseDate?: string };

const blank: Draft = {
  title: "",
  type: "SINGLE",
  featuredArtists: "",
  description: "",
  releaseDate: asDate(new Date().toISOString()),
  isFeatured: false,
  artwork: "",
};

export function AdminReleases() {
  useMeta("Music — MXK Admin");
  const [list, setList] = useState<Release[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get<Release[]>("/api/releases?all=1")
      .then(setList)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);
  const set = (k: keyof Draft, v: unknown) => setDraft((d) => ({ ...d!, [k]: v }));

  async function save() {
    if (!draft?.title) return;
    setBusy(true);
    try {
      if (draft.id) await api.patch(`/api/releases/${draft.id}`, draft);
      else await api.post("/api/releases", draft);
      setDraft(null);
      await load();
    } finally {
      setBusy(false);
    }
  }
  async function remove(r: Release) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    await api.delete(`/api/releases/${r.id}`);
    await load();
  }

  return (
    <div>
      <PageTitle
        title="Music"
        action={
          <button onClick={() => setDraft({ ...blank })} className={btnPrimary}>
            + New release
          </button>
        }
      />

      {draft && (
        <div className="border-line bg-ink-2 mb-8 rounded-2xl border p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className={inputCls} value={draft.title ?? ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Type">
              <select className={inputCls} value={draft.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t} className="bg-ink-3">
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Featured artists">
              <input className={inputCls} placeholder="feat. …" value={draft.featuredArtists ?? ""} onChange={(e) => set("featuredArtists", e.target.value)} />
            </Field>
            <Field label="Release date">
              <input type="date" className={inputCls} value={asDate(draft.releaseDate)} onChange={(e) => set("releaseDate", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <ImageField label="Artwork" value={draft.artwork ?? ""} onChange={(v) => set("artwork", v)} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea className={inputCls} rows={3} value={draft.description ?? ""} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
            {(
              [
                ["spotify", "Spotify"],
                ["appleMusic", "Apple Music"],
                ["soundcloud", "SoundCloud"],
                ["youtube", "YouTube"],
                ["beatport", "Beatport"],
                ["embedUrl", "Embed (YouTube) URL"],
              ] as const
            ).map(([k, lbl]) => (
              <Field key={k} label={lbl}>
                <input className={inputCls} value={(draft[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
            <div className="sm:col-span-2">
              <AudioField
                label="Preview audio — plays in the site player (upload an mp3/m4a or paste a URL)"
                value={draft.previewUrl ?? ""}
                onChange={(v) => set("previewUrl", v)}
              />
            </div>
            <label className="text-chrome flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={!!draft.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured on homepage — this becomes
              the entrance / "Now Playing" song when it has preview audio
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={save} disabled={busy} className={btnPrimary}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setDraft(null)} className={btnGhost}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((r) => (
          <div key={r.id} className="border-line bg-ink-2 flex items-center gap-3 rounded-xl border p-3">
            <div className="bg-ink-3 h-14 w-14 shrink-0 overflow-hidden rounded-lg">
              {r.artwork ? <img src={mediaUrl(r.artwork)} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-chrome truncate font-semibold">
                {r.title} {r.isFeatured && <span className="bg-blue/20 text-blue ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold">FEATURED</span>}
              </p>
              <p className="text-fog truncate text-xs">
                {r.type.replace("_", " ")} · {asDate(r.releaseDate)} {r.featuredArtists}
              </p>
            </div>
            <button onClick={() => setDraft({ ...r, releaseDate: asDate(r.releaseDate) })} className={btnGhost}>
              Edit
            </button>
            <button onClick={() => remove(r)} className="text-red hover:bg-red/10 rounded-full px-3 py-2 text-sm">
              Delete
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-fog">No releases yet.</p>}
      </div>
    </div>
  );
}
