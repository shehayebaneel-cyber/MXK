import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const day = 86400000;
const now = Date.now();

const releases = [
  {
    slug: "nour", title: "Nour", type: "SINGLE", featuredArtists: "",
    releaseDate: new Date(now + 14 * day), isFeatured: true, // upcoming → countdown + pre-save
    description: "A cinematic blend of live drums and Arabic-tinged electronic textures. Out soon.",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    spotify: "", appleMusic: "", soundcloud: "", youtube: "",
  },
  {
    slug: "ya-habibi-taala", title: "Ya Habibi Taala", type: "ARABIC_HOUSE", featuredArtists: "feat. Layla",
    releaseDate: new Date(now - 30 * day), description: "Arabic House Vol.1 — where the dabke meets the dancefloor.",
    artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", youtube: "https://youtube.com",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    slug: "midnight-drive", title: "Midnight Drive", type: "SINGLE", releaseDate: new Date(now - 90 * day),
    description: "Late-night driving energy — warm analog synths over a live break.",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    spotify: "https://spotify.com", appleMusic: "https://music.apple.com",
  },
  {
    slug: "pulse-remix", title: "Pulse (MXK Remix)", type: "REMIX", releaseDate: new Date(now - 160 * day),
    description: "A driving, percussive reimagining built for peak-time sets.",
    artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    beatport: "https://beatport.com", soundcloud: "https://soundcloud.com",
  },
  {
    slug: "arabic-house-vol-2", title: "Arabic House Vol.2", type: "ARABIC_HOUSE", releaseDate: new Date(now - 200 * day),
    description: "The second chapter — heavier low-end, deeper roots.",
    artwork: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", youtube: "https://youtube.com",
  },
];

const events = [
  {
    slug: "bldx-2025", title: "BLDX 2025", venue: "The Grand Factory", city: "Beirut",
    date: new Date(now + 40 * day), description: "A full live-and-electronic set — drums, decks and Arabic House.",
    poster: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80", ticketUrl: "https://tickets.com",
  },
  {
    slug: "montreal-underground", title: "Montréal Underground", venue: "Newspeak", city: "Montréal",
    date: new Date(now - 60 * day), description: "A sweaty basement night in the heart of Montréal.",
    poster: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
    photos: JSON.stringify(["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"]),
  },
];

async function main() {
  for (const r of releases) {
    await prisma.release.upsert({ where: { slug: r.slug }, create: r as never, update: r as never });
  }
  for (const e of events) {
    await prisma.event.upsert({ where: { slug: e.slug }, create: e as never, update: e as never });
  }
  const settings: Record<string, string> = {
    instagram: "https://instagram.com/mxk", spotify: "https://spotify.com", soundcloud: "https://soundcloud.com",
    youtube: "https://youtube.com", beatport: "https://beatport.com", bookingEmail: "booking@mxk.com",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  console.log("Seeded", releases.length, "releases,", events.length, "events.");
}

main().finally(() => prisma.$disconnect());
