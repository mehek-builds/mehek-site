"use client";
// THE TAB MARK — the site's ink globe, spinning, in the browser tab icon.
// Chrome will not animate a GIF/APNG favicon (it freezes on frame one), so the
// only path that actually moves is this: draw the globe to a tiny offscreen
// canvas each frame and swap the <link rel="icon"> href to the fresh PNG. Same
// sphere math and same paper/ink treatment as the corner mark (OriginGlobe) and
// the opening (IntroZoomOut); a light paper disc so it reads on dark tab strips,
// ink graticule + land so it reads on light ones. Contrast is bumped over the
// on-page stamp because a 16px icon needs it. Reduced-motion and no-JS get the
// static twin instead: the server-rendered SVG icon link in app/layout.tsx, so
// this component simply does nothing in that case. Pauses while the tab is
// hidden. Mehek call 2026-07-15 (ruled animated, seeing the DO#6 motion-law tension).
import { useEffect } from "react";
import LAND_ARCS from "@/lib/land-arcs";

const RAD = Math.PI / 180;

export default function FaviconGlobe() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // static twin (icon.svg) stands

    const SIZE = 64; // rendered large, downscaled by the browser to 16/32 for crispness
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Upgrade the one server-rendered icon link (the static SVG twin) in place.
    // Setting its href every frame means no second link to race, and if anything
    // ever reset it, the next frame overwrites it — self-healing by construction.
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";

    /* ---- geometry (same Natural Earth data as the site globe) ---- */
    const prep = (flat: number[]) => {
      const n = flat.length / 2;
      const lam = new Float64Array(n), sp = new Float64Array(n), cp = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        lam[i] = (flat[2 * i] / 10) * RAD;
        const phi = (flat[2 * i + 1] / 10) * RAD;
        sp[i] = Math.sin(phi); cp[i] = Math.cos(phi);
      }
      return { n, lam, sp, cp };
    };
    const LAND = LAND_ARCS.map(prep);
    const GRAT: ReturnType<typeof prep>[] = [];
    for (let lon = -180; lon < 180; lon += 30) {
      const flat: number[] = [];
      for (let lat = -80; lat <= 80; lat += 5) flat.push(lon * 10, lat * 10);
      GRAT.push(prep(flat));
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const flat: number[] = [];
      for (let lon = -180; lon <= 180; lon += 5) flat.push(lon * 10, lat * 10);
      GRAT.push(prep(flat));
    }

    // Fixed gentle tilt (view from slightly north); only longitude spins.
    const VIEW_LAT = 18;
    const rot = { lam0: 0, sinP0: Math.sin(VIEW_LAT * RAD), cosP0: Math.cos(VIEW_LAT * RAD) };
    const CX = SIZE / 2, CY = SIZE / 2, R = SIZE * 0.42;

    const strokeLines = (list: ReturnType<typeof prep>[], color: string, width: number) => {
      ctx.beginPath();
      for (const a of list) {
        let pen = false;
        for (let i = 0; i < a.n; i++) {
          const dl = a.lam[i] - rot.lam0;
          const x = a.cp[i] * Math.sin(dl);
          const y = rot.cosP0 * a.sp[i] - rot.sinP0 * a.cp[i] * Math.cos(dl);
          const z = rot.sinP0 * a.sp[i] + rot.cosP0 * a.cp[i] * Math.cos(dl);
          if (z > 0.006) {
            if (pen) ctx.lineTo(CX + x * R, CY - y * R);
            else { ctx.moveTo(CX + x * R, CY - y * R); pen = true; }
          } else pen = false;
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    const draw = (lonDeg: number) => {
      rot.lam0 = lonDeg * RAD;
      ctx.clearRect(0, 0, SIZE, SIZE);
      // paper sphere
      const g = ctx.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.2, CX, CY, R);
      g.addColorStop(0, "#fffefb");
      g.addColorStop(1, "#f4f1e9");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();
      // ink detail (higher contrast than the on-page stamp so it survives 16px)
      strokeLines(GRAT, "rgba(24,20,12,0.16)", 1);
      strokeLines(LAND, "rgba(24,20,12,0.82)", 1.5);
      // rim
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7);
      ctx.strokeStyle = "rgba(24,20,12,0.36)";
      ctx.lineWidth = 2;
      ctx.stroke();
      link.href = canvas.toDataURL("image/png");
    };

    /* ---- slow spin, throttled, paused when hidden ---- */
    const DEG_PER_MS = 15 / 1000; // ~24s per revolution (slow spin)
    const FRAME_MS = 66; // ~15fps: smooth enough for a slow turn, easy on the tab
    let start = performance.now();
    let lonAtStart = 0;
    let lastDraw = 0;
    let raf = 0;
    const tick = (now: number) => {
      if (now - lastDraw >= FRAME_MS) {
        lastDraw = now;
        draw((lonAtStart + (now - start) * DEG_PER_MS) % 360);
      }
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        // resume from where the icon froze, no jump
        lonAtStart = (lonAtStart + (performance.now() - start) * DEG_PER_MS) % 360;
        start = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    draw(0);
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
