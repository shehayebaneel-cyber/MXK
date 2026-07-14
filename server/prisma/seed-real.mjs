// Replace placeholder content with MXK's REAL catalogue, links and bio
// (sourced from his Spotify / Apple Music / SoundCloud / Anghami / Instagram).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SPOTIFY = "https://open.spotify.com/artist/1WPlLaPCih20a9fQLH39i5";
const SOUNDCLOUD = "https://soundcloud.com/mxk-33";

const releases = [
  {
    slug: "ya-habibi-taala", title: "Ya Habibi Taala", type: "ARABIC_HOUSE", featuredArtists: "feat. Leen Hamo",
    releaseDate: new Date("2026-07-17T00:00:00Z"), isFeatured: true,
    description: "An Arabic classic reimagined — MXK and Leen Hamo turn heritage into a melodic house anthem. Out July 17.",
    artwork: "/artwork/mxk-portrait.jpg", spotify: SPOTIFY, soundcloud: SOUNDCLOUD,
  },
  {
    slug: "nour", title: "Nour", type: "SINGLE", featuredArtists: "with naï",
    releaseDate: new Date("2026-01-16T00:00:00Z"),
    description: "A melodic house journey — warm, driving and cinematic. MXK & naï.",
    artwork: "/artwork/nour.jpg", spotify: SPOTIFY, soundcloud: SOUNDCLOUD,
    appleMusic: "https://music.apple.com/us/album/nour/1863760631?i=1863760635",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/86/d0/a8/86d0a898-cd8e-a877-4165-43493327e39d/mzaf_14025136297091514366.plus.aac.p.m4a",
  },
  {
    slug: "inta-mabsoot", title: "Inta Mabsoot?", type: "SINGLE", featuredArtists: "with Khaledx",
    releaseDate: new Date("2025-11-20T00:00:00Z"),
    description: "Peak-time techno energy with an Arabic soul.",
    artwork: "/artwork/inta-mabsoot.jpg", spotify: SPOTIFY, soundcloud: SOUNDCLOUD,
    appleMusic: "https://music.apple.com/us/album/inta-mabsoot/1849463546?i=1849463547",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/da/16/f2da167c-177d-fde9-d6c4-6d9d0151bf6c/mzaf_16886955060003543336.plus.aac.p.m4a",
  },
  {
    slug: "el-masoul", title: "El Mas'oul", type: "ARABIC_HOUSE", featuredArtists: "",
    releaseDate: new Date("2024-12-06T00:00:00Z"),
    description: "Arab melodic house at its finest — rooted rhythms, modern low end.",
    artwork: "/artwork/el-masoul.jpg", spotify: SPOTIFY, soundcloud: SOUNDCLOUD,
    appleMusic: "https://music.apple.com/us/album/el-masoul/1819508591?i=1819508596",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/69/db/d3/69dbd302-6f1c-5fcb-da39-9066493e948c/mzaf_1794278240842533670.plus.aac.p.m4a",
  },
  {
    slug: "rouhi-fidak", title: "Rouhi Fidak", type: "ARABIC_HOUSE", featuredArtists: "feat. Leen Hamo",
    releaseDate: new Date("2024-10-17T00:00:00Z"),
    description: "A soulful Arabic vocal over a deep, hypnotic groove.",
    artwork: "/artwork/rouhi-fidak.jpg", spotify: SPOTIFY, soundcloud: SOUNDCLOUD,
    appleMusic: "https://music.apple.com/us/album/rouhi-fidak/1770835568?i=1770835570",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/67/e1/6867e18d-c8cc-b0f6-4f8c-3e7e55c677b5/mzaf_9446926537059676082.plus.aac.p.m4a",
  },
  {
    slug: "fly-away", title: "Fly Away", type: "SINGLE", featuredArtists: "feat. Nawal",
    releaseDate: new Date("2024-02-23T00:00:00Z"),
    description: "Uplifting vocal house — MXK featuring Nawal.",
    artwork: "/artwork/fly-away.jpg", spotify: SPOTIFY, soundcloud: SOUNDCLOUD,
    appleMusic: "https://music.apple.com/us/album/fly-away-feat-nawal/1717582422?i=1717582425",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/dc/b9/cf/dcb9cfd8-ccbe-eefe-07fc-69effdb44427/mzaf_4858493310604128757.plus.aac.p.m4a",
  },
];

const events = [
  { slug: "bldx-bshamoun-2025", title: "MXK for BLDX — Bshamoun", venue: "BLDX", city: "Bshamoun, Lebanon",
    date: new Date("2025-10-05T21:00:00Z"),
    description: "A full hour of drums, decks and Arab house — MXK live for BLDX in the hills of Bshamoun, Lebanon. Over 100k views on the set.",
    videos: JSON.stringify([]) },
  { slug: "tapestry-toronto", title: "MXK B2B at Tapestry", venue: "Tapestry (224 Augusta Ave)", city: "Toronto",
    date: new Date("2026-04-25T21:00:00Z"),
    description: "MXK B2B set alongside Bobby Shaw and Reef in the heart of Toronto." },
  { slug: "nye-halifax", title: "New Year's Eve — MXK & Robert Haroun", venue: "Lion's Head Tavern (3081 Robie St)", city: "Halifax",
    date: new Date("2025-12-31T22:00:00Z"),
    description: "Ringing in the new year with MXK and Robert Haroun in Halifax." },
  { slug: "mxk-halifax-may", title: "MXK Live — Halifax", venue: "Halifax", city: "Halifax",
    date: new Date("2026-05-25T21:00:00Z"),
    description: "MXK live in Halifax." },
];

const settings = {
  heroTitle: "MXK // MAKRAM",
  heroTagline: "Producer • Drummer • DJ",
  heroImage: "/artwork/mxk-portrait.jpg",
  bio: "MXK — Makram — is a Lebanese-Canadian producer, drummer and DJ based in Toronto. He fuses live percussion with electronic production into a signature Arab Melodic House sound, moving between the clubs of Canada and the roots of Lebanon.",
  instagram: "https://instagram.com/mxk.music",
  spotify: SPOTIFY,
  appleMusic: "https://music.apple.com/us/album/nour/1863760631",
  soundcloud: SOUNDCLOUD,
  anghami: "https://play.anghami.com/artist/2708570",
  youtube: "https://youtube.com/@mxkmusic",
  beatport: "",
  bookingEmail: "ashkar.makram@gmail.com",
};

async function main() {
  await prisma.release.deleteMany({});
  await prisma.event.deleteMany({});
  for (const r of releases) await prisma.release.create({ data: r });
  for (const e of events) await prisma.event.create({ data: e });
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  console.log(`Seeded ${releases.length} real releases, ${events.length} events, ${Object.keys(settings).length} settings.`);
}

main().finally(() => prisma.$disconnect());
