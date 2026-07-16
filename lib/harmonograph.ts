// THE HARMONOGRAPH KERNEL — the shared figure, moon, and trail.
//
// Extracted from HeroHarmonograph 2026-07-16 when Mehek chose "Moonrise" for
// the reel's title: the reel is meant to read as the SAME hand as the hero, so
// the two must never drift. Both the hero backdrop and MoonTitle draw from
// here; retune once and both move together. Everything below carries the
// original tuning rationale, because the numbers are measured, not taste.

export interface Params {
  a: number; b: number; c: number; d: number;
  p1: number; p2: number; p3: number; p4: number;
}

// Near-integer frequency ratios, slightly detuned, so the figure precesses and
// never repeats.
export function seed(): Params {
  const pick = () => 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 (denser loops)
  const det = () => (Math.random() - 0.5) * 0.006; // tiny detune -> slow precession
  const ph = () => Math.random() * Math.PI * 2;
  return {
    a: pick() + det(), b: pick() + det(), c: pick() + det(), d: pick() + det(),
    p1: ph(), p2: ph(), p3: ph(), p4: ph(),
  };
}

// Two detuned sine pairs per axis. Amplitude is per-axis (ax, ay) so a wide,
// shallow box (a line of type) gets an ellipse-shaped figure that actually
// sweeps the words, while the hero passes the same value twice for its
// original circular field.
export function point(
  p: Params,
  t: number,
  cx: number,
  cy: number,
  ax: number,
  ay: number
): [number, number] {
  const x = cx + ax * 0.5 * (Math.sin(p.a * t + p.p1) + Math.sin(p.b * t + p.p2));
  const y = cy + ay * 0.5 * (Math.sin(p.c * t + p.p3) + Math.sin(p.d * t + p.p4));
  return [x, y];
}

export function drawMoon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  glow: number
) {
  ctx.beginPath();
  ctx.fillStyle = "rgba(24,20,12,0.92)";
  ctx.shadowColor = "rgba(24,20,12,0.35)";
  ctx.shadowBlur = 3 + glow * 5;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// A harmonograph is a mathematically space-filling curve: given enough time it
// densely weaves through its whole bounding region, so an exponential-decay
// "comet trail" can't cap it (measured 0.03-0.4 erase all settled at ~6-7%
// canvas coverage, and the erase-rate-vs-coverage curve has a knife-edge
// bifurcation, not a gradient). Fixed-length buffer instead: only the last
// MAX_TRAIL points are ever drawn, redrawn fresh every frame.
export const MAX_TRAIL = 600;

// Re-measured against the LIVE terishim.com canvas (lineWidth / strokeStyle
// read off their context, not guessed): lineWidth 0.9, base alpha 0.22, butt
// cap, no shadowBlur. Thinner than ~0.3 width starves the anti-aliased
// coverage and the line renders as a broken scratch: the softness must come
// from a no-dpr canvas blurring a CONSISTENTLY covered line, not from starving
// the line. Alpha tapers per segment from 0.22 at the head (the moon) to 0 at
// the tail, drawn oldest-first so newer segments layer on top.
export function strokeTrail(ctx: CanvasRenderingContext2D, trail: [number, number][]) {
  ctx.lineWidth = 0.9;
  ctx.lineCap = "butt";
  for (let i = 1; i < trail.length; i++) {
    const age = 1 - i / trail.length; // 0 at head, ~1 at oldest
    const segAlpha = 0.22 * (1 - age);
    if (segAlpha <= 0.002) continue;
    ctx.strokeStyle = `rgba(24,20,12,${segAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1][0], trail[i - 1][1]);
    ctx.lineTo(trail[i][0], trail[i][1]);
    ctx.stroke();
  }
}
