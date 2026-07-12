"use client";
// The hero's living backdrop: a field of the site's own node motif (rounded
// squares). Most nodes are quiet ink; a scattering glow ember and twinkle — the
// real/shipped ones — so the hero is literally made of the Record it invites you
// to scroll into, and ember still means "real" (design law 1 holds). Draws a
// rich static first frame so it shows even if rAF is throttled; reduced motion
// keeps that static frame.
import { useEffect, useRef } from "react";

// Deterministic pseudo-random so the field is stable across renders.
function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

interface Node {
  x: number;
  y: number;
  s: number;
  ember: boolean;
  a: number;
  sp: number;
  ph: number;
}

export default function HeroBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let raf = 0;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];

    const roundRect = (x: number, y: number, size: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + size, y, x + size, y + size, r);
      ctx.arcTo(x + size, y + size, x, y + size, r);
      ctx.arcTo(x, y + size, x, y, r);
      ctx.arcTo(x, y, x + size, y, r);
      ctx.closePath();
    };

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = Math.max(40, Math.min(58, w / 24));
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      nodes = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const r = hash(i * 17.3 + j * 991.7);
          const ember = r < 0.16;
          nodes.push({
            x: i * gap + (hash(i * 73.1 + j * 131.3) - 0.5) * gap * 0.55,
            y: j * gap + (hash(i * 911.7 + j * 57.1) - 0.5) * gap * 0.55,
            s: ember ? 6 : 3.4,
            ember,
            a: ember ? 0.4 + hash(i + j * 3) * 0.4 : 0.07 + hash(i * 3 + j) * 0.07,
            sp: 0.3 + hash(i * 5.1 + j * 7.3) * 0.7,
            ph: hash(i * 13.7 + j * 29.1) * Math.PI * 2,
          });
        }
      }
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        const tw = n.ember ? 0.5 + 0.5 * Math.sin(t * n.sp + n.ph) : 1;
        const drift = n.ember ? 3.5 : 1.4;
        const px = n.x + Math.sin(t * 0.16 + n.ph) * drift;
        const py = n.y + Math.cos(t * 0.13 + n.ph) * drift;
        const alpha = n.a * tw;
        if (n.ember) {
          ctx.shadowColor = `rgba(217,102,10,${(alpha * 0.85).toFixed(3)})`;
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(217,102,10,${alpha.toFixed(3)})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(24,20,12,${alpha.toFixed(3)})`;
        }
        roundRect(px - n.s / 2, py - n.s / 2, n.s, 1.6);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      t += 0.016;
      draw();
      raf = requestAnimationFrame(loop);
    };

    build();
    draw(); // rich static first frame
    if (!reduce) loop();

    const onResize = () => {
      build();
      draw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
