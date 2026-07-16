"use client";
// MOONRISE ON A TITLE (Mehek ruling, 2026-07-16: "I like Moonrise for highlight
// reel"). The hero's moon, compressed to a single line of type: the same
// harmonograph hand from lib/harmonograph runs a wide, shallow figure across
// the words and its light is what pulls them from ghost to full ink.
//
// She ruled this seeing the flag that it spends the hero's signature twice, so
// the moon is now a site-wide character rather than a hero device.
//
// Structure mirrors the hero exactly: the ghost IS the real server-rendered
// text (a plain fetch returns the title), and the lit layer is an aria-hidden
// duplicate masked to the moonlight. Reduced-motion parks the moon and prints
// the title in full ink (the static twin: DON'T #5).
import { useEffect, useRef } from "react";
import { MAX_TRAIL, drawMoon, point, seed, strokeTrail } from "../lib/harmonograph";

// keep in sync with .mt-harmo's inset in scenes.css: the canvas overhangs the
// box, so canvas space has to be offset back into box space for the mask. The
// overhang is small and mostly horizontal: the moon has to be able to run off
// the ends of the words, but it must never wander ABOVE them (Mehek,
// 2026-07-16: "this random little line right above the Highlight reel text ...
// they should look like one cohesive piece"). The first cut derived the
// figure's amplitude from this padded canvas, so the moon swung ±68px around a
// 44px-tall line and spent most of its life off the type, reading as a stray
// mark rather than part of the title.
const INSET_X = -26;
const INSET_Y = -14;

export default function MoonTitle({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setMoon = (x: number, y: number) => {
      // the canvas is inset around the box, so offset back into box space
      box.style.setProperty("--moon-x", `${(x + INSET_X).toFixed(1)}px`);
      box.style.setProperty("--moon-y", `${(y + INSET_Y).toFixed(1)}px`);
    };

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // dpr 1 on purpose: the browser upscaling a 1x bitmap is what softens the
    // stroke. See lib/harmonograph. Matching dpr here makes it crisp and wrong.
    const dpr = 1;

    let w = 0, h = 0, cx = 0, cy = 0, ax = 0, ay = 0;
    let params = seed();

    const at = (t: number): [number, number] => point(params, t, cx, cy, ax, ay);

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(24,20,12,0.14)";
      ctx.beginPath();
      for (let tt = 0; tt < 120; tt += 0.01) {
        const [x, y] = at(tt);
        if (tt === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const [mx, my] = at(42);
      drawMoon(ctx, mx, my, 3, 0);
      setMoon(mx, my);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w * 0.5;
      cy = h * 0.5;
      // The figure is measured against the TYPE, not the padded canvas. A line
      // of type is a wide, shallow box, so the amplitudes split (the hero's
      // single min(w,h) amplitude would pin the moon to a small circle in the
      // middle and never reach the ends of the words). Deriving them from the
      // canvas instead was the "random little line" bug: the padding became
      // amplitude, so the moon flew above the words and the trail read as a
      // stray mark floating over the title.
      const typeW = w + INSET_X * 2; // INSET_* are negative: strip the overhang
      const typeH = h + INSET_Y * 2;
      // horizontal: sweep the full width and a little past the ends, so every
      // letter gets lit and the curve exits rather than turning back in view
      ax = typeW * 0.62;
      // vertical: stay inside the type's own band. The moon rides through the
      // words, so the trail always reads as part of the title.
      ay = typeH * 0.34;
      drawStatic();
    };
    // the title reflows (clamp font size, wrapping), so track the box itself
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (reduce) return () => ro.disconnect();

    const trail: [number, number][] = [];
    let t = 0, started = false, raf = 0;

    const step = () => {
      if (!started) {
        trail.push(at(t));
        started = true;
      }
      // no hover bump here: the hero owns that interaction, and a section
      // title that quickens under the cursor is motion carrying no message
      const speed = 0.001;
      for (let i = 0; i < 4; i++) {
        t += speed;
        trail.push(at(t));
      }
      while (trail.length > MAX_TRAIL) trail.shift();

      ctx.clearRect(0, 0, w, h);
      strokeTrail(ctx, trail);

      const [lx, ly] = trail[trail.length - 1];
      drawMoon(ctx, lx, ly, 3, 0);
      setMoon(lx, ly);

      params.p2 += 0.00006;
      params.p4 += 0.00004;
      raf = requestAnimationFrame(step);
    };
    step();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="moon-title" ref={boxRef}>
      <canvas className="mt-harmo" ref={canvasRef} aria-hidden="true" />
      <div className="mt-light" aria-hidden="true" />
      {/* the ghost is the real text: a plain fetch returns the title */}
      <h2 className="mt-ghost">{text}</h2>
      <h2 className="mt-lit" aria-hidden="true">
        {text}
      </h2>
    </div>
  );
}
