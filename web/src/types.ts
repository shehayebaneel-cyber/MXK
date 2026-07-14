export interface Release {
  id: number;
  slug: string;
  title: string;
  type: "SINGLE" | "ALBUM" | "REMIX" | "COLLAB" | "ARABIC_HOUSE";
  artwork: string | null;
  releaseDate: string;
  featuredArtists: string;
  description: string;
  spotify: string | null;
  appleMusic: string | null;
  soundcloud: string | null;
  youtube: string | null;
  beatport: string | null;
  previewUrl: string | null;
  embedUrl: string | null;
  isFeatured: boolean;
}

export interface MXKEvent {
  id: number;
  slug: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  poster: string | null;
  description: string;
  ticketUrl: string | null;
  tracklist: string;
  photos: string[];
  videos: string[];
}

export interface ArchiveItem {
  id: number;
  type: "PHOTO" | "VIDEO";
  category: "LIVE" | "STUDIO" | "BTS";
  url: string;
  thumbnail: string | null;
  caption: string;
}

export interface Settings {
  heroVideo: string;
  heroTitle: string;
  heroTagline: string;
  bio: string;
  instagram: string;
  spotify: string;
  appleMusic: string;
  soundcloud: string;
  beatport: string;
  youtube: string;
  bookingEmail: string;
}
