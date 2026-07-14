// Lightweight CSS visualizer — bars animate while audio plays, freeze when
// paused. No Web Audio cost; ambient and cheap.
export function Equalizer({ active, bars = 5, className = "" }: { active: boolean; bars?: number; className?: string }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-full bg-gradient-to-t from-blue to-purple"
          style={{
            height: "100%",
            animationDuration: `${0.6 + (i % 3) * 0.22}s`,
            animationDelay: `${i * 0.11}s`,
            animationPlayState: active ? "running" : "paused",
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
