import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

export type Track = { id: number; title: string; artist: string; artwork: string | null; src: string };

interface PlayerValue {
  queue: Track[];
  current: Track | null;
  isPlaying: boolean;
  progress: number; // 0..1
  duration: number;
  volume: number;
  play: (tracks: Track[], index?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (fraction: number) => void;
  setVolume: (v: number) => void;
  close: () => void;
}

const Ctx = createContext<PlayerValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVol] = useState(0.8);

  const current = queue[index] ?? null;

  // Single <audio> for the whole app — created once, never unmounted, so it
  // keeps playing while the user navigates between pages.
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;
    const onTime = () => { setProgress(audio.duration ? audio.currentTime / audio.duration : 0); setDuration(audio.duration || 0); };
    const onEnd = () => setIndex((i) => (i + 1 < queueRef.current.length ? i + 1 : i));
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => { audio.pause(); audio.src = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref of the queue for the 'ended' handler (avoids stale closure).
  const queueRef = useRef<Track[]>([]);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // Load + play whenever the current track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.src = current.src;
    audio.play().catch(() => setIsPlaying(false));
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const value: PlayerValue = {
    queue, current, isPlaying, progress, duration, volume,
    play: (tracks, i = 0) => {
      const playable = tracks.filter((t) => t.src);
      if (!playable.length) return;
      setQueue(playable);
      setIndex(Math.min(i, playable.length - 1));
    },
    toggle: () => {
      const audio = audioRef.current;
      if (!audio || !current) return;
      audio.paused ? audio.play().catch(() => {}) : audio.pause();
    },
    next: () => setIndex((i) => (i + 1 < queue.length ? i + 1 : 0)),
    prev: () => setIndex((i) => (i > 0 ? i - 1 : i)),
    seek: (f) => { const audio = audioRef.current; if (audio && audio.duration) audio.currentTime = f * audio.duration; },
    setVolume: (v) => setVol(Math.max(0, Math.min(1, v))),
    close: () => { audioRef.current?.pause(); setQueue([]); setIndex(0); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
