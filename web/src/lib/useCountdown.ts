import { useEffect, useState } from "react";

/** Returns time remaining until `target`, or null once it has passed. */
export function useCountdown(target: string | Date) {
  const to = new Date(target).getTime();
  const [remaining, setRemaining] = useState(() => to - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(to - Date.now()), 1000);
    return () => clearInterval(id);
  }, [to]);

  if (remaining <= 0) return null;
  const s = Math.floor(remaining / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
