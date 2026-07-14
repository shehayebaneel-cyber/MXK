import { useEffect, useState } from "react";
import { ImageField } from "../components/ImageField";
import { api } from "../lib/api";
import { useMeta } from "../lib/useMeta";
import type { Settings } from "../types";
import { Field, PageTitle, btnPrimary, inputCls } from "./ui";

const FIELDS: { key: keyof Settings; label: string; area?: boolean }[] = [
  { key: "heroTitle", label: "Hero title" },
  { key: "heroTagline", label: "Hero tagline" },
  { key: "heroVideo", label: "Hero video URL (mp4) — optional, overrides the image" },
  { key: "bio", label: "Biography", area: true },
  { key: "instagram", label: "Instagram URL" },
  { key: "spotify", label: "Spotify URL" },
  { key: "appleMusic", label: "Apple Music URL" },
  { key: "anghami", label: "Anghami URL" },
  { key: "soundcloud", label: "SoundCloud URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "beatport", label: "Beatport URL" },
  { key: "bookingEmail", label: "Booking email" },
];

export function AdminSettings() {
  useMeta("Settings — MXK Admin");
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get<Settings>("/api/settings").then(setS).catch(() => {}); }, []);
  const set = (k: keyof Settings, v: string) => { setS((p) => ({ ...p!, [k]: v })); setSaved(false); };

  async function save() {
    if (!s) return;
    setBusy(true);
    try { await api.put("/api/settings", s); setSaved(true); } finally { setBusy(false); }
  }

  if (!s) return <p className="text-fog">Loading…</p>;

  return (
    <div>
      <PageTitle title="Settings" action={<button onClick={save} disabled={busy} className={btnPrimary}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}</button>} />
      <div className="max-w-2xl space-y-4 rounded-2xl border border-line bg-ink-2 p-5">
        <ImageField label="Hero / portrait image" value={s.heroImage} onChange={(v) => set("heroImage", v)} />
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            {f.area
              ? <textarea className={inputCls} rows={4} value={s[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              : <input className={inputCls} value={s[f.key]} onChange={(e) => set(f.key, e.target.value)} />}
          </Field>
        ))}
        <button onClick={save} disabled={busy} className={btnPrimary}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}</button>
      </div>
    </div>
  );
}
