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
import { useEffect, useRef } from "react";

interface Params {
  a: number; b: number; c: number; d: number;
  p1: number; p2: number; p3: number; p4: number;
}

function seed(): Params {
  const pick = () => 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 (denser loops)
  const det = () => (Math.random() - 0.5) * 0.006; // tiny detune -> slow precession
  const ph = () => Math.random() * Math.PI * 2;
  return {
    a: pick() + det(), b: pick() + det(), c: pick() + det(), d: pick() + det(),
    p1: ph(), p2: ph(), p3: ph(), p4: ph(),
  };
}

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
    const dpr = Math.min(2, window.devicePixelRatio || 1);

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

    const point = (t: number): [number, number] => {
      const { a, b, c, d, p1, p2, p3, p4 } = params;
      const x = cx + A * 0.5 * (Math.sin(a * t + p1) + Math.sin(b * t + p2));
      const y = cy + A * 0.5 * (Math.sin(c * t + p3) + Math.sin(d * t + p4));
      return [x, y];
    };

    const drawMoon = (x: number, y: number, r: number, glow: number) => {
      ctx.beginPath();
      ctx.fillStyle = "rgba(24,20,12,0.92)";
      ctx.shadowColor = "rgba(24,20,12,0.35)";
      ctx.shadowBlur = 3 + glow * 5;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(24,20,12,0.14)";
      ctx.beginPath();
      for (let tt = 0; tt < 120; tt += 0.01) {
        const [x, y] = point(tt);
        if (tt === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const [mx, my] = point(42);
      drawMoon(mx, my, 3, 0);
      setMoon(mx, my);
      setActiveLine(my);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w * 0.37;
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

    let t = 0, px = 0, py = 0, started = false, raf = 0;
    const step = () => {
      // ease hover 0 -> 1 (or back) instead of snapping, so the glow/speed
      // bump ramps smoothly rather than jumping the instant the cursor enters
      hover += (hoverTarget - hover) * 0.06;

      // fade the previous ribbon toward transparent (comet trail)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      ctx.lineWidth = 0.04;
      ctx.strokeStyle = "rgba(24,20,12,0.38)";
      ctx.lineCap = "round";
      ctx.beginPath();
      if (!started) {
        const [x0, y0] = point(t);
        px = x0; py = y0;
        started = true;
      }
      ctx.moveTo(px, py);
      let lx = px, ly = py;
      // hovering quickens the draw a little (up to ~1.8x), not the shape
      const speed = 0.001 * (1 + hover * 0.8);
      for (let i = 0; i < 4; i++) {
        t += speed;
        const [x, y] = point(t);
        ctx.lineTo(x, y);
        lx = x; ly = y;
      }
      ctx.stroke();
      px = lx; py = ly;
      drawMoon(lx, ly, 3, hover);
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
