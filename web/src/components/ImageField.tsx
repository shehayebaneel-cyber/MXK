import { useRef, useState } from "react";
import { api, mediaUrl } from "../lib/api";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read the image.")); };
    img.src = url;
  });
}

// Shrink + compress a photo in the browser before upload (a phone photo becomes
// ~50–150 KB), so uploads are fast and images load quickly afterwards.
async function downscale(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  let w: number, h: number, src: CanvasImageSource;
  try { const b = await createImageBitmap(file); w = b.width; h = b.height; src = b; }
  catch { const i = await loadImage(file); w = i.naturalWidth; h = i.naturalHeight; src = i; }
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const nw = Math.max(1, Math.round(w * scale)), nh = Math.max(1, Math.round(h * scale));
  const c = document.createElement("canvas");
  c.width = nw; c.height = nh;
  const ctx = c.getContext("2d");
  if (!ctx) return new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
  ctx.drawImage(src, 0, 0, nw, nh);
  return c.toDataURL("image/jpeg", quality);
}

export function ImageField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Choose an image file.");
    setBusy(true); setErr("");
    try {
      const dataUrl = await downscale(file);
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
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-ink-3 text-xs text-fog transition hover:border-blue disabled:opacity-50">
          {value ? <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" /> : busy ? "…" : "Upload"}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Upload or paste an image URL"
              className="min-w-0 flex-1 rounded-lg border border-line bg-ink-3 px-3 py-2 text-sm text-chrome outline-none focus:border-blue" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
              className="shrink-0 rounded-lg bg-chrome px-3 py-2 text-sm font-semibold text-ink disabled:opacity-50">{busy ? "…" : "Upload"}</button>
            {value && <button type="button" onClick={() => onChange("")} className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm text-fog">Clear</button>}
          </div>
          {err && <p className="mt-1 text-xs text-red">{err}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
