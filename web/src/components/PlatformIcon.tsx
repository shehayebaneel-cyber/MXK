// Monochrome brand glyphs (inherit currentColor) for the streaming/social hub.
const ICONS: Record<string, JSX.Element> = {
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </g>
  ),
  spotify: (
    <path
      fill="currentColor"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.42a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.08-.5 9.72 1.11.29.18.38.56.21.86Zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.5c3.63-1.09 8.15-.55 11.24 1.34.37.23.49.71.25 1.07Zm.11-2.85C14.83 8.98 9.6 8.8 6.53 9.73a.94.94 0 1 1-.54-1.8c3.52-1.06 9.3-.86 12.96 1.31a.94.94 0 0 1-.96 1.61Z"
    />
  ),
  "apple music": (
    <path
      fill="currentColor"
      d="M16.36 12.7c-.02-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.75-3.12.75-.64 0-1.64-.73-2.7-.71-1.39.02-2.67.81-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.67-.66 1.24 0 1.6.66 2.69.64 1.11-.02 1.81-1 2.49-2 .78-1.15 1.11-2.26 1.13-2.32-.02-.01-2.17-.83-2.19-3.3ZM14.3 6.6c.57-.69.95-1.65.85-2.6-.82.03-1.81.55-2.4 1.23-.53.61-.99 1.58-.86 2.51.91.07 1.84-.46 2.41-1.14Z"
    />
  ),
  anghami: (
    <path
      fill="currentColor"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM9 9a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1Zm3-2a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm3 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"
    />
  ),
  soundcloud: (
    <path
      fill="currentColor"
      d="M1 14.5v2.5h1v-2.5H1Zm2-1.2V17h1v-3.7H3Zm2-1.3V17h1v-5H5Zm2-.5V17h1v-6.5H7Zm2.2-1V17H10V9.8c-.3.1-.6.3-.8.7ZM11 9.4V17h9a3.5 3.5 0 0 0 .4-6.98A5.5 5.5 0 0 0 11 9.4Z"
    />
  ),
  youtube: (
    <path
      fill="currentColor"
      d="M23.5 6.9a3 3 0 0 0-2.1-2.12C19.5 4.25 12 4.25 12 4.25s-7.5 0-9.4.53A3 3 0 0 0 .5 6.9 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.1 3 3 0 0 0 2.1 2.12c1.9.53 9.4.53 9.4.53s7.5 0 9.4-.53a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.1ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"
    />
  ),
};

export function PlatformIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const icon = ICONS[name.toLowerCase()];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {icon}
    </svg>
  );
}
