import { usePlayer } from "../player/PlayerContext";
import { mediaUrl } from "../lib/api";

// Persistent player docked at the bottom of every page. Hidden until something
// is queued. Continues playing across route changes (audio lives in context).
export function FloatingPlayer() {
  const p = usePlayer();
  if (!p.current) return null;
  const art = mediaUrl(p.current.artwork) || "";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink-2/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-6">
        {art ? (
          <img src={art} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover sm:h-12 sm:w-12" />
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-md bg-ink-3 sm:h-12 sm:w-12" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-chrome">{p.current.title}</p>
          <p className="truncate text-xs text-fog">{p.current.artist}</p>
          {/* progress */}
          <div
            className="mt-1.5 h-1 cursor-pointer rounded-full bg-line"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              p.seek((e.clientX - r.left) / r.width);
            }}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-blue to-purple" style={{ width: `${p.progress * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={p.prev} aria-label="Previous" className="p-2 text-fog transition hover:text-chrome">⏮</button>
          <button onClick={p.toggle} aria-label="Play/Pause" className="flex h-10 w-10 items-center justify-center rounded-full bg-chrome text-ink transition hover:scale-105">
            {p.isPlaying ? "❚❚" : "▶"}
          </button>
          <button onClick={p.next} aria-label="Next" className="p-2 text-fog transition hover:text-chrome">⏭</button>
          <input
            type="range" min={0} max={1} step={0.01} value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="ml-1 hidden w-20 accent-blue sm:block"
          />
          <button onClick={p.close} aria-label="Close player" className="p-2 text-fog transition hover:text-red">✕</button>
        </div>
      </div>
    </div>
  );
}
