"use client";
// The Golden Snitch: a tiny winged gold orb that trails the real cursor
// everywhere on the site. It eases toward the pointer (lag, not a snap) so it
// flutters after you like the real thing chasing across a pitch, while its two
// feathered wings beat on a fast CSS loop and the whole body bobs. Rebuilt as
// inline SVG (not a borrowed image) so it stays crisp at any size and animates
// cheaply. Off entirely under reduced-motion or on touch (no real cursor to
// follow), and never intercepts clicks (pointer-events: none throughout).
import { useEffect, useRef } from "react";

export default function CursorSnitch() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    // The snitch now *is* the cursor: hide the native pointer site-wide. Scoped
    // to a root class we only add here, so touch / reduced-motion visitors (who
    // get no snitch, per the guards above) keep their normal system cursor.
    const root = document.documentElement;
    root.classList.add("snitch-active");

    let x = 0, y = 0, tx = 0, ty = 0;
    let started = false;
    let away = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // First move ever, or the first move after the pointer left the window:
      // snap the snitch onto the pointer (don't slide it in from its old spot).
      if (!started || away) {
        x = tx;
        y = ty;
        started = true;
        away = false;
      }
      // Always ensure it's visible on any movement. This is the fix for the
      // pointer vanishing after it left and re-entered the window: opacity used
      // to be set once, so onLeave could hide it with nothing to bring it back.
      el.style.opacity = "1";
    };
    // Only hide when the pointer truly leaves the window (no relatedTarget),
    // not on every internal element boundary — mouseleave on <html> fired
    // spuriously and made the snitch flicker.
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        away = true;
        el.style.opacity = "0";
      }
    };

    const tick = () => {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("snitch-active");
    };
  }, []);

  return (
    <div className="cursor-snitch" ref={ref} aria-hidden="true">
      <svg
        className="cursor-snitch-svg"
        viewBox="0 0 64 64"
        width="16"
        height="16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Monochrome body: bright specular highlight top-left down to a
             near-black ink rim (matches the site's ink, #1b1a17). No color. */}
          <radialGradient id="snitchBall" cx="38%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#f4f3f1" />
            <stop offset="34%" stopColor="#b8b6b1" />
            <stop offset="74%" stopColor="#605e59" />
            <stop offset="100%" stopColor="#1b1a17" />
          </radialGradient>
          {/* Wing shading in greys: pale near the hinge (by the ball), a touch
             darker toward the tips so the wings read as dimensional, not flat. */}
          <linearGradient id="snitchWingL" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#f3f2f0" />
            <stop offset="100%" stopColor="#c4c2bd" />
          </linearGradient>
          <linearGradient id="snitchWingR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f3f2f0" />
            <stop offset="100%" stopColor="#c4c2bd" />
          </linearGradient>
        </defs>

        {/* LEFT wing */}
        <g className="snitch-wing snitch-wing-l">
          <path
            d="M29 32 Q16 18 2 22 Q10 28 4 33 Q17 34 29 33 Z"
            fill="url(#snitchWingL)"
            stroke="#2b2a27"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M28 32 Q18 26 6 25 M28 32 Q19 30 7 31 M28 32 Q17 22 11 20"
            stroke="#7c7a75"
            strokeWidth="0.7"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
        </g>

        {/* RIGHT wing */}
        <g className="snitch-wing snitch-wing-r">
          <path
            d="M35 32 Q48 18 62 22 Q54 28 60 33 Q47 34 35 33 Z"
            fill="url(#snitchWingR)"
            stroke="#2b2a27"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M36 32 Q46 26 58 25 M36 32 Q45 30 57 31 M36 32 Q47 22 53 20"
            stroke="#7c7a75"
            strokeWidth="0.7"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
        </g>

        {/* Body — thin ink edge so the ball separates from a light background. */}
        <circle
          cx="32"
          cy="32"
          r="8"
          fill="url(#snitchBall)"
          stroke="#1b1a17"
          strokeWidth="0.9"
        />
        {/* Etched filigree bands */}
        <path
          d="M25 30 Q32 27 39 30 M25 34 Q32 37 39 34"
          stroke="#1b1a17"
          strokeWidth="0.7"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />
        {/* Specular glint */}
        <circle cx="29" cy="29.5" r="1.9" fill="#ffffff" fillOpacity="0.92" />
      </svg>
    </div>
  );
}
