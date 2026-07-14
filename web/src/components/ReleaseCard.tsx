import { Link } from "react-router-dom";
import { mediaUrl } from "../lib/api";
import { usePlayer, Track } from "../player/PlayerContext";
import type { Release } from "../types";

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
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-ink-3">
      <Link to={`/music/${release.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink-2">
          {art ? (
            <img src={art} alt={release.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
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
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-chrome text-ink opacity-0 shadow-lg transition group-hover:opacity-100 hover:scale-105"
        >▶</button>
      )}
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blue">{TYPE_LABEL[release.type] ?? release.type}</p>
        <Link to={`/music/${release.slug}`}>
          <h3 className="mt-1 font-semibold leading-tight text-chrome transition hover:text-blue">{release.title}</h3>
        </Link>
        {release.featuredArtists && <p className="mt-0.5 text-sm text-fog">{release.featuredArtists}</p>}
      </div>
    </div>
  );
}
