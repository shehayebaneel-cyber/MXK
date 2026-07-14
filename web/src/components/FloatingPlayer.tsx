import { usePlayer } from "../player/PlayerContext";
import { mediaUrl } from "../lib/api";
import { Equalizer } from "./Equalizer";

// Persistent, floating glass "console" docked at the bottom. Hidden until
// something is queued; keeps playing across route changes.
export function FloatingPlayer() {
  const p = usePlayer();
  if (!p.current) return null;
  const art = mediaUrl(p.current.artwork) || "";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
      <div className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-ink-2/70 px-3 py-2.5 shadow-[0_24px_70px_-18px_rgba(79,124,255,0.45)] ring-1 ring-inset ring-white/5 backdrop-blur-2xl sm:gap-4 sm:px-5">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg sm:h-12 sm:w-12">
          {art ? <img src={art} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-ink-3" />}
          <div className="absolute inset-x-0 bottom-0 flex h-4 items-end justify-center gap-[2px] bg-gradient-to-t from-ink/80 to-transparent pb-0.5">
            <Equalizer active={p.isPlaying} bars={4} className="h-3" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-chrome">{p.current.title}</p>
          <p className="truncate text-xs text-fog">{p.current.artist}</p>
          <div
            className="mt-1.5 h-1 cursor-pointer rounded-full bg-line"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); p.seek((e.clientX - r.left) / r.width); }}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-blue to-purple" style={{ width: `${p.progress * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={p.prev} aria-label="Previous" className="p-2 text-fog transition hover:text-chrome">⏮</button>
          <button onClick={p.toggle} aria-label="Play/Pause" className="flex h-10 w-10 items-center justify-center rounded-full bg-chrome text-ink shadow-lg transition hover:scale-105">
            {p.isPlaying ? "❚❚" : "▶"}
          </button>
          <button onClick={p.next} aria-label="Next" className="p-2 text-fog transition hover:text-chrome">⏭</button>
          <input type="range" min={0} max={1} step={0.01} value={p.volume} onChange={(e) => p.setVolume(Number(e.target.value))} aria-label="Volume" className="ml-1 hidden w-20 accent-blue sm:block" />
          <button onClick={p.close} aria-label="Close player" className="p-2 text-fog transition hover:text-red">✕</button>
        </div>
      </div>
    </div>
  );
}
