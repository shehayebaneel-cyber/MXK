import { useRef, useState } from "react";
import { api, mediaUrl } from "../lib/api";

const MAX = 10 * 1024 * 1024; // keep to short previews

const readDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error("Couldn't read the file."));
    r.readAsDataURL(file);
  });

/** Upload a short audio preview (mp3/m4a…) to the DB, or paste a URL. */
export function AudioField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) { setErr("Choose an audio file (MP3, M4A…)."); return; }
    if (file.size > MAX) { setErr("Audio too large — keep previews under 10 MB."); return; }
    setBusy(true); setErr("");
    try {
      const dataUrl = await readDataUrl(file);
      const { url } = await api.post<{ url: string }>("/api/uploads", { dataUrl });
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-fog">{label}</label>}
      <div className="flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Upload a file or paste an audio URL"
          className="min-w-0 flex-1 rounded-lg border border-line bg-ink-3 px-3 py-2 text-sm text-chrome outline-none focus:border-blue" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="shrink-0 rounded-lg bg-chrome px-3 py-2 text-sm font-semibold text-ink disabled:opacity-50">{busy ? "Uploading…" : "♪ Upload"}</button>
        {value && <button type="button" onClick={() => onChange("")} className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm text-fog">Clear</button>}
      </div>
      {value && <audio src={mediaUrl(value)} controls preload="none" className="mt-2 h-9 w-full" />}
      {err && <p className="mt-1 text-xs text-red">{err}</p>}
      <input ref={fileRef} type="file" accept="audio/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
