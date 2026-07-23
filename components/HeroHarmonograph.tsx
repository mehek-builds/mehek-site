"use client";
// THE HARMONOGRAPH + MOONLIGHT — the hero backdrop. A single ink moon slowly
// draws a small, compressed, ever-evolving looping curve (a harmonograph: near-
// integer frequency ratios, slightly detuned so it precesses and never repeats),
// and casts a cool pool of light that follows it (--moon-x/--moon-y on .hero),
// which is what reveals the name in ink as it sweeps past. Hovering the hero
// brightens the moonlight and quickens the draw — the curve's own shape never
// depends on the cursor, so it can never fragment mid-stroke the way bending
// it in place did. A letter key reseeds it. Reduced-motion: a static figure,
// moon parked.
// The figure, the moon, and the trail tuning live in lib/harmonograph so the
// drawing behavior stays isolated from the hero component.
import { useEffect, useRef } from "react";
import { MAX_TRAIL, drawMoon, point, seed, strokeTrail } from "../lib/harmonograph";

export default function HeroHarmonograph() {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // The moon's light + the name-reveal both key off --moon-x/--moon-y, set on
    // the .hero (a common ancestor of the moonlight and the lit text layer).
    const heroEl = canvas.closest(".hero") as HTMLElement | null;
    const setMoon = (x: number, y: number) => {
      heroEl?.style.setProperty("--moon-x", `${x.toFixed(1)}px`);
      heroEl?.style.setProperty("--moon-y", `${y.toFixed(1)}px`);
    };
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Deliberately NOT matching devicePixelRatio here (reference: terishim.com's
    // orbit canvas does the same — backing width equals CSS width even on a 2x
    // display). That forces the browser to upscale/blur the bitmap to fill a
    // retina screen, which softens the stroke edges — a crisp dpr-matched
    // canvas can't reproduce that same soft, hazy thinness no matter how low
    // lineWidth/alpha go.
    const dpr = 1;

    let w = 0, h = 0, cx = 0, cy = 0, A = 0;
    let params = seed();
    // hover eases 0 -> 1 on mouseenter and back on mouseleave (see step()).
    // It never touches point()'s shape — only draw speed and moonlight glow —
    // so the curve can't fragment the way cursor-bending it in place did.
    let hover = 0, hoverTarget = 0;

    // Only the line the moon currently sits over should ever be visible at
    // all — not just its ink reveal, but its ghost too. Earlier this only
    // gated the lit (ink) layer, so the OTHER line's permanent ~11% ghost
    // stayed on screen the whole time, which read as "an already-erased
    // line sitting in the background" (Mehek: only the current line should
    // be seen, full stop). Ghost spans (".ht-ghost > span") and lit spans
    // (".ht-lit > span") are two separate DOM trees at the same position;
    // both members of a line pair fade together.
    const ghostEls: HTMLElement[] = Array.from(
      heroEl?.querySelectorAll<HTMLElement>(".ht-ghost > span") ?? []
    );
    const litEls: HTMLElement[] = Array.from(
      heroEl?.querySelectorAll<HTMLElement>(".ht-lit > span") ?? []
    );
    let lineMid: number[] = [];
    const measureLines = () => {
      if (!heroEl || ghostEls.length === 0) return;
      const heroTop = heroEl.getBoundingClientRect().top;
      lineMid = ghostEls.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top - heroTop + r.height / 2;
      });
    };
    const setActiveLine = (moonY: number) => {
      if (lineMid.length === 0) return;
      let closest = 0;
      let bestDist = Infinity;
      lineMid.forEach((mid, i) => {
        const dist = Math.abs(moonY - mid);
        if (dist < bestDist) { bestDist = dist; closest = i; }
      });
      ghostEls.forEach((el, i) => {
        el.style.opacity = i === closest ? "1" : "0";
      });
      litEls.forEach((el, i) => {
        el.style.opacity = i === closest ? "1" : "0";
      });
    };

    // the hero's field is roughly square, so both axes share one amplitude
    const at = (t: number): [number, number] => point(params, t, cx, cy, A, A);

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
      setActiveLine(my);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w * 0.5;
      cy = h * 0.45;
      A = Math.min(w, h) * 0.3;
      measureLines();
      drawStatic(); // initial figure (also the still frame if reduced-motion)
    };
    resize();
    window.addEventListener("resize", resize);

    if (reduce) {
      return () => window.removeEventListener("resize", resize);
    }

    // Mehek: keep the harmonograph (not an orbit ellipse), but shrink its
    // visible memory drastically. The fixed-length trail buffer and its
    // measured stroke tuning live in lib/harmonograph, with the full rationale.
    const trail: [number, number][] = [];

    let t = 0, started = false, raf = 0;
    const step = () => {
      // ease hover 0 -> 1 (or back) instead of snapping, so the glow/speed
      // bump ramps smoothly rather than jumping the instant the cursor enters
      hover += (hoverTarget - hover) * 0.06;

      if (!started) {
        trail.push(at(t));
        started = true;
      }
      // hovering quickens the draw a little (up to ~1.8x), not the shape
      const speed = 0.001 * (1 + hover * 0.8);
      for (let i = 0; i < 4; i++) {
        t += speed;
        trail.push(at(t));
      }
      while (trail.length > MAX_TRAIL) trail.shift();

      ctx.clearRect(0, 0, w, h);
      strokeTrail(ctx, trail);

      const [lx, ly] = trail[trail.length - 1];
      drawMoon(ctx, lx, ly, 3, hover);
      setMoon(lx, ly);
      setActiveLine(ly);
      // hovering brightens the moonlight pool (see .hero-moonlight in CSS)
      heroEl?.style.setProperty("--moon-glow", (1 + hover * 0.55).toFixed(2));

      // very slow drift so the figure keeps evolving
      params.p2 += 0.00006;
      params.p4 += 0.00004;
      raf = requestAnimationFrame(step);
    };

    const onEnter = () => { hoverTarget = 1; };
    const onLeave = () => { hoverTarget = 0; };
    // easter egg: any letter key reseeds the pendulums to a new figure
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        params = seed();
        t = 0;
        started = false;
        trail.length = 0;
        ctx.clearRect(0, 0, w, h);
      }
    };

    heroEl?.addEventListener("mouseenter", onEnter);
    heroEl?.addEventListener("mouseleave", onLeave);
    window.addEventListener("keydown", onKey);
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      heroEl?.removeEventListener("mouseenter", onEnter);
      heroEl?.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="hero-moon-scene" ref={scene} aria-hidden="true">
      <canvas ref={ref} className="hero-harmo" />
      <div className="hero-moonlight" />
    </div>
  );
}
