import { ReactNode, useEffect, useRef } from "react";

// Pointer-driven 3D tilt. Desktop + fine-pointer only; respects reduced motion.
// Sets CSS vars (--rx/--ry/--sc/--tx/--ty/--lx/--ly) the styles read. Movement
// is clamped small (premium, not dizzying) and returns smoothly on leave.
export function Tilt({
  children,
  className = "",
  maxRX = 4,
  maxRY = 6,
  scale = 1.02,
  lift = 0,
}: {
  children: ReactNode;
  className?: string;
  maxRX?: number;
  maxRY?: number;
  scale?: number;
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // skip touch / low-power

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(-py * 2 * maxRX).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(px * 2 * maxRY).toFixed(2)}deg`);
        el.style.setProperty("--tx", (px * 2).toFixed(3));
        el.style.setProperty("--ty", (py * 2).toFixed(3));
        el.style.setProperty("--lx", `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--ly", `${((py + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--sc", String(scale));
        if (lift) el.style.setProperty("--ty2", `-${lift}px`);
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--tx", "0");
      el.style.setProperty("--ty", "0");
      el.style.setProperty("--sc", "1");
      el.style.setProperty("--ty2", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(raf);
    };
  }, [maxRX, maxRY, scale, lift]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
