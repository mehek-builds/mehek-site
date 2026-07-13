"use client";
// A tiny ink dot + ring that follows the cursor everywhere on the site, at
// low opacity — an always-on, subtle echo of the hero's moon motif rather
// than a literal borrowed "planet" cursor (Mehek liked terishim.com's
// cursor-planet feel; this is ours: the same ink, not their icon). Eases
// toward the real pointer (lag, not a snap) so it reads as a soft trailing
// mark. Off entirely under reduced-motion or on touch (no real cursor to
// follow), and never intercepts clicks (pointer-events: none throughout).
import { useEffect, useRef } from "react";

export default function CursorMoon() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    let x = 0, y = 0, tx = 0, ty = 0;
    let started = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!started) {
        x = tx;
        y = ty;
        started = true;
        el.style.opacity = "1";
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    const tick = () => {
      x += (tx - x) * 0.15;
      y += (ty - y) * 0.15;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="cursor-moon" ref={ref} aria-hidden="true">
      <span className="cursor-moon-ring" />
      <span className="cursor-moon-dot" />
    </div>
  );
}
