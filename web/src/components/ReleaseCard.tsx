import { Link } from "react-router-dom";
import { mediaUrl } from "../lib/api";
import { usePlayer, Track } from "../player/PlayerContext";
import type { Release } from "../types";
import { Tilt } from "./Tilt";

export const toTrack = (r: Release): Track => ({
  id: r.id, title: r.title, artist: r.featuredArtists ? `MXK ${r.featuredArtists}` : "MXK",
  artwork: r.artwork, src: mediaUrl(r.previewUrl),
});

const TYPE_LABEL: Record<string, string> = {
  SINGLE: "Single", ALBUM: "Album", REMIX: "Remix", COLLAB: "Collaboration", ARABIC_HOUSE: "Arabic House",
};

export function ReleaseCard({ release }: { release: Release }) {
  const player = usePlayer();
  const art = mediaUrl(release.artwork);

  return (
    <Tilt
      className="card3d group relative overflow-hidden rounded-2xl border border-line bg-ink-3 shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-shadow duration-500 hover:shadow-[0_26px_55px_-18px_rgba(79,124,255,0.55)]"
      maxRX={3} maxRY={3} scale={1.02} lift={8}
    >
      {/* edge glow on hover */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 ring-1 ring-inset ring-blue/50 transition-opacity duration-500 group-hover:opacity-100" />
      <Link to={`/music/${release.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink-2">
          {art ? (
            <img src={art} alt={release.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center text-fog">MXK</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        </div>
      </Link>
      {release.previewUrl && (
        <button
          onClick={() => player.play([toTrack(release)])}
          aria-label={`Play ${release.title}`}
          className="absolute left-1/2 top-[calc(50%-2rem)] z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center rounded-full bg-chrome/95 text-lg text-ink opacity-0 shadow-2xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:!scale-110"
        >▶</button>
      )}
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue">{TYPE_LABEL[release.type] ?? release.type}</p>
        <Link to={`/music/${release.slug}`}>
          <h3 className="mt-1 font-semibold leading-tight text-chrome transition hover:text-blue">{release.title}</h3>
        </Link>
        {release.featuredArtists && <p className="mt-0.5 text-sm text-fog">{release.featuredArtists}</p>}
      </div>
    </Tilt>
  );
}
