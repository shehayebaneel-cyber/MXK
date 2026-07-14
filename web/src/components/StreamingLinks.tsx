import type { Release } from "../types";

const PLATFORMS: { key: keyof Release; label: string; color: string }[] = [
  { key: "spotify", label: "Spotify", color: "hover:border-[#1DB954] hover:text-[#1DB954]" },
  { key: "appleMusic", label: "Apple Music", color: "hover:border-[#fa57c1] hover:text-[#fa57c1]" },
  { key: "soundcloud", label: "SoundCloud", color: "hover:border-[#ff5500] hover:text-[#ff5500]" },
  { key: "youtube", label: "YouTube", color: "hover:border-[#ff0033] hover:text-[#ff0033]" },
  { key: "beatport", label: "Beatport", color: "hover:border-[#a6ff4d] hover:text-[#a6ff4d]" },
];

export function StreamingLinks({ release, size = "md" }: { release: Release; size?: "sm" | "md" }) {
  const links = PLATFORMS.filter((p) => release[p.key]);
  if (!links.length) return null;
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((p) => (
        <a key={p.key} href={String(release[p.key])} target="_blank" rel="noreferrer"
          className={`rounded-full border border-line font-semibold text-chrome transition ${pad} ${p.color}`}>
          {p.label} ↗
        </a>
      ))}
    </div>
  );
}
