export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

export const parseArr = (s: unknown): string[] => {
  if (Array.isArray(s)) return s as string[];
  try {
    const v = JSON.parse(String(s ?? "[]"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export const toJsonArr = (v: unknown): string => JSON.stringify(Array.isArray(v) ? v : parseArr(v));

// Serialize an event, parsing its JSON media arrays for the client.
export const outEvent = <T extends { photos?: unknown; videos?: unknown }>(e: T) => ({
  ...e,
  photos: parseArr(e.photos),
  videos: parseArr(e.videos),
});
