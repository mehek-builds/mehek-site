"use client";
// Scene 4.5 — THE ROUTE. The origin story as a looping ink globe: zoom into
// New Delhi (born), Dubai (raised), Los Angeles ("Continuing building."), pin
// each, pull back to the whole map between stops, then glide home and start
// over (~25s cycle). Ink treatment on the site's paper; the ember accent marks
// the pins and flight line only — places lived are verified facts, so the
// "ember = real" law holds. The DXB→LAX leg is deliberately drawn the long way
// west (Istanbul, Paris, the Atlantic, New York) instead of the true Arctic
// great circle: crossing the continents in between is what makes the distance
// read. Starts when scrolled into view; reduced-motion gets the finished map.
// Draft provenance + the parked visited-dots epilogue:
// Second Brain/2-content/founder-site-origin-globe-draft.html
import { useEffect, useRef } from "react";
import LAND_ARCS from "@/lib/land-arcs";

const RAD = Math.PI / 180;
const ZOOM = 2.1;

const CITIES = [
  { code: "DEL", name: "New Delhi", country: "India", lon: 77.209, lat: 28.6139, line: "Born here." },
  { code: "DXB", name: "Dubai", country: "United Arab Emirates", lon: 55.2708, lat: 25.2048, line: "Raised here." },
  { code: "LAX", name: "Los Angeles", country: "United States", lon: -118.2437, lat: 34.0522, line: "Continuing building." },
] as const;

// Ink on the site's paper; ember only on the facts (pins + flight line).
const INK = {
  sphere: "#fffefb", // --glass
  land: "rgba(24,20,12,0.78)",
  grat: "rgba(24,20,12,0.05)",
  rim: "rgba(24,20,12,0.16)",
  route: "#d9660a", // --amber
  routeDone: "rgba(217,102,10,0.4)",
  pin: "#d9660a",
  pinCore: "#fffefb",
  label: "rgba(24,20,12,0.55)",
};

type V3 = [number, number, number];

// Two mountings, one engine. The full scene ("The route", between Leading and
// The Person) carries captions and the rail; `stamp` renders just the globe as
// the site's persistent mark, fixed top-left on every scene (no zoom, quieter
// ink, smaller pins). Clicking it returns to the hero, logo-style (Mehek call
// 2026-07-13); it hides below 820px alongside the sticky nav.
// `markHref` lets the corner mark point home from a second surface (/about),
// where "#top" would be a no-op. On the film it stays the hero anchor.
export default function OriginGlobe({
  stamp = false,
  markHref = "#top",
}: {
  stamp?: boolean;
  markHref?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  const cityRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!canvas || !stage || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const zoomMax = stamp ? 1 : ZOOM; // the stamp never zooms; it just turns

    /* ---- sphere math ---- */
    const v3 = (lon: number, lat: number): V3 => {
      const l = lon * RAD, p = lat * RAD;
      return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
    };
    const toLonLat = (v: V3): [number, number] => [
      Math.atan2(v[1], v[0]) / RAD,
      Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD,
    ];
    const slerp = (a: V3, b: V3, t: number): V3 => {
      let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      d = Math.max(-1, Math.min(1, d));
      const om = Math.acos(d);
      if (om < 1e-6) return [a[0], a[1], a[2]];
      const so = Math.sin(om), ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so;
      return [ka * a[0] + kb * b[0], ka * a[1] + kb * b[1], ka * a[2] + kb * b[2]];
    };
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    /* ---- precomputed geometry ---- */
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
    for (let lon = -180; lon < 180; lon += 20) {
      const flat: number[] = [];
      for (let lat = -84; lat <= 84; lat += 4) flat.push(lon * 10, lat * 10);
      GRAT.push(prep(flat));
    }
    for (let lat = -60; lat <= 60; lat += 20) {
      const flat: number[] = [];
      for (let lon = -180; lon <= 180; lon += 4) flat.push(lon * 10, lat * 10);
      GRAT.push(prep(flat));
    }

    const cityV = CITIES.map((c) => v3(c.lon, c.lat));

    // Flight paths; leg 2 sweeps west across the continents (see header note).
    const LEGS = [
      { via: [] as [number, number][], pts: [] as V3[], cum: [0], total: 0, a: 0, b: 1 },
      { via: [[28.9, 41], [2.35, 48.86], [-30, 45], [-74, 40.7], [-100, 38]] as [number, number][], pts: [] as V3[], cum: [0], total: 0, a: 1, b: 2 },
    ];
    for (const leg of LEGS) {
      leg.pts = [cityV[leg.a], ...leg.via.map((w) => v3(w[0], w[1])), cityV[leg.b]];
      leg.cum = [0];
      for (let i = 1; i < leg.pts.length; i++) {
        const d = leg.pts[i - 1][0] * leg.pts[i][0] + leg.pts[i - 1][1] * leg.pts[i][1] + leg.pts[i - 1][2] * leg.pts[i][2];
        leg.cum.push(leg.cum[i - 1] + Math.acos(Math.max(-1, Math.min(1, d))));
      }
      leg.total = leg.cum[leg.cum.length - 1];
    }
    const legPoint = (li: number, t: number): V3 => {
      const leg = LEGS[li];
      const target = t * leg.total;
      let i = 1;
      while (i < leg.cum.length - 1 && leg.cum[i] < target) i++;
      const span = leg.cum[i] - leg.cum[i - 1] || 1e-9;
      return slerp(leg.pts[i - 1], leg.pts[i], (target - leg.cum[i - 1]) / span);
    };
    const legKm = (li: number) => LEGS[li].total * 6371;

    /* ---- sequence ---- */
    const SEGMENTS: { t: string; c?: number; a?: number; b?: number; dur?: number }[] = [
      { t: "intro", dur: 1000 },
      { t: "zoomIn", c: 0, dur: 1100 },
      { t: "pin", c: 0, dur: 2000 },
      { t: "zoomOut", c: 0, dur: 900 },
      { t: "transit", a: 0, b: 1, dur: 2200 },
      { t: "zoomIn", c: 1, dur: 1100 },
      { t: "pin", c: 1, dur: 2000 },
      { t: "zoomOut", c: 1, dur: 900 },
      { t: "transit", a: 1, b: 2, dur: 4300 },
      { t: "zoomIn", c: 2, dur: 1100 },
      { t: "pin", c: 2, dur: 5000 },
      { t: "zoomOut", c: 2, dur: 900 },
      { t: "return", dur: 2600 },
    ];
    const PIN_SEG = CITIES.map((_, i) => SEGMENTS.findIndex((s) => s.t === "pin" && s.c === i));

    const state: {
      seg: number;
      segTime: number;
      cam: { lon: number; lat: number };
      zoom: number;
      intro: number;
      pinT: number[];
      legP: number[];
      journeyFade: number;
      jump: null | { fromV: V3; toC: number; fromZoom: number; t: number; dur: number };
    } = {
      seg: 0,
      segTime: 0,
      cam: { lon: CITIES[0].lon, lat: CITIES[0].lat },
      zoom: 1,
      intro: 0,
      pinT: [-1, -1, -1],
      legP: [0, 0],
      journeyFade: 1,
      jump: null,
    };

    /* ---- caption (left column, imperative updates) ---- */
    const cap = capRef.current, codeEl = codeRef.current, cityEl = cityRef.current,
      metaEl = metaRef.current, lineEl = lineRef.current;
    let capState = "";
    let swapTimer = 0;
    const swapCaption = (apply: () => void) => {
      if (reduced || !cap) { apply(); return; }
      cap.classList.add("route-swap");
      window.clearTimeout(swapTimer);
      swapTimer = window.setTimeout(() => { apply(); cap.classList.remove("route-swap"); }, 280);
    };
    const fmtCoord = (c: (typeof CITIES)[number]) =>
      `${Math.abs(c.lat).toFixed(2)}° ${c.lat >= 0 ? "N" : "S"} · ${Math.abs(c.lon).toFixed(2)}° ${c.lon >= 0 ? "E" : "W"} · ${c.country}`;
    const setCaption = (i: number) => {
      if (capState === `c${i}`) return;
      capState = `c${i}`;
      swapCaption(() => {
        if (!codeEl || !cityEl || !metaEl || !lineEl) return;
        codeEl.textContent = `0${i + 1} · ${CITIES[i].code}`;
        cityEl.textContent = CITIES[i].name;
        metaEl.textContent = fmtCoord(CITIES[i]);
        lineEl.textContent = CITIES[i].line;
      });
    };
    const setTransitCaption = (a: number, b: number) => {
      if (capState === `t${a}`) return;
      capState = `t${a}`;
      swapCaption(() => {
        if (!codeEl || !cityEl || !metaEl || !lineEl) return;
        codeEl.textContent = "En route";
        cityEl.textContent = `${CITIES[a].code} → ${CITIES[b].code}`;
        metaEl.textContent = `≈ ${(Math.round(legKm(a) / 10) * 10).toLocaleString("en-US")} km`;
        lineEl.textContent = "";
      });
    };
    const clearCaption = () => {
      if (capState === "blank") return;
      capState = "blank";
      swapCaption(() => {
        if (!codeEl || !cityEl || !metaEl || !lineEl) return;
        codeEl.textContent = ""; cityEl.textContent = ""; metaEl.textContent = ""; lineEl.textContent = "";
      });
    };

    /* ---- canvas ---- */
    let W = 0, H = 0, DPR = 1, CX = 0, CY = 0, R = 0;
    const resize = () => {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = stage.clientWidth; H = stage.clientHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      CX = W * 0.5; CY = H * 0.5;
      R = Math.min(W, H) * (stamp ? 0.46 : 0.4);
    };
    resize();
    window.addEventListener("resize", resize);
    // the stage column can change width without a window resize
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(stage);

    const rot = { sinP0: 0, cosP0: 1, lam0: 0 };
    const setRotation = (lon: number, lat: number) => {
      rot.lam0 = lon * RAD;
      rot.sinP0 = Math.sin(lat * RAD);
      rot.cosP0 = Math.cos(lat * RAD);
    };
    const proj = (lam: number, sp: number, cp: number, alt: number): [number, number, number] => {
      const dl = lam - rot.lam0;
      const cdl = Math.cos(dl), sdl = Math.sin(dl);
      const x = cp * sdl;
      const y = rot.cosP0 * sp - rot.sinP0 * cp * cdl;
      const z = rot.sinP0 * sp + rot.cosP0 * cp * cdl;
      const s = R * state.zoom * (1 + alt);
      return [CX + x * s, CY - y * s, z];
    };
    const projLonLat = (lon: number, lat: number, alt: number) => {
      const l = lon * RAD, p = lat * RAD;
      return proj(l, Math.sin(p), Math.cos(p), alt);
    };

    const strokePolylines = (list: ReturnType<typeof prep>[], color: string, alpha: number) => {
      ctx.beginPath();
      for (const a of list) {
        let pen = false;
        for (let i = 0; i < a.n; i++) {
          const pt = proj(a.lam[i], a.sp[i], a.cp[i], 0);
          if (pt[2] > 0.005) {
            if (pen) ctx.lineTo(pt[0], pt[1]);
            else { ctx.moveTo(pt[0], pt[1]); pen = true; }
          } else pen = false;
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawSphere = () => {
      const RZ = R * state.zoom;
      const g = ctx.createRadialGradient(CX - RZ * 0.35, CY - RZ * 0.4, RZ * 0.2, CX, CY, RZ);
      g.addColorStop(0, INK.sphere);
      g.addColorStop(1, "#f4f1e9");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(CX, CY, RZ, 0, 7); ctx.fill();
    };
    const drawRim = () => {
      ctx.beginPath(); ctx.arc(CX, CY, R * state.zoom, 0, 7);
      ctx.strokeStyle = stamp ? "rgba(24,20,12,0.13)" : INK.rim;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const ROUTE_N = 110;
    const drawRoute = (legIdx: number, p: number, done: boolean) => {
      if (p <= 0) return null;
      ctx.beginPath();
      let pen = false, tip: [number, number, number] | null = null;
      const steps = Math.max(2, Math.ceil(ROUTE_N * p));
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * p;
        const v = legPoint(legIdx, t);
        const [lon, lat] = toLonLat(v);
        const alt = 0.065 * Math.sin(Math.PI * t);
        const pt = projLonLat(lon, lat, alt);
        if (pt[2] > -0.015) {
          if (pen) ctx.lineTo(pt[0], pt[1]);
          else { ctx.moveTo(pt[0], pt[1]); pen = true; }
          tip = pt;
        } else pen = false;
      }
      ctx.strokeStyle = done ? INK.routeDone : INK.route;
      ctx.lineWidth = (done ? 1.1 : 1.6) * (stamp ? 0.75 : 1);
      ctx.setLineDash(done ? [4, 5] : []);
      ctx.globalAlpha = state.journeyFade;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      return tip;
    };
    const drawComet = (pt: [number, number, number] | null) => {
      if (!pt) return;
      ctx.save();
      ctx.shadowColor = INK.route;
      ctx.shadowBlur = stamp ? 8 : 12;
      ctx.fillStyle = INK.route;
      ctx.beginPath(); ctx.arc(pt[0], pt[1], stamp ? 1.8 : 2.4, 0, 7); ctx.fill();
      ctx.restore();
    };
    const drawPin = (cIdx: number, ms: number) => {
      const c = CITIES[cIdx];
      const pt = projLonLat(c.lon, c.lat, 0);
      if (pt[2] < 0.02) return;
      const ps = stamp ? 0.62 : 1; // stamp pins stay proportionate to the small disc
      const fade = Math.min(1, (pt[2] - 0.02) / 0.12);
      const drop = reduced ? 1 : Math.min(1, ms / 620);
      const e = easeOutCubic(drop);
      const dy = (1 - e) * -26 * ps;
      ctx.save();
      ctx.globalAlpha = fade * state.journeyFade;
      if (!reduced && ms > 480 && ms < 1600) {
        const rt = (ms - 480) / 1120;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], (3 + rt * 16) * ps, 0, 7);
        ctx.strokeStyle = INK.pin;
        ctx.globalAlpha = fade * state.journeyFade * (1 - rt) * 0.55;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = fade * state.journeyFade;
      }
      ctx.translate(pt[0], pt[1] + dy);
      ctx.scale((0.6 + 0.4 * e) * ps, (0.6 + 0.4 * e) * ps);
      ctx.beginPath();
      ctx.arc(0, -12.5, 5.6, Math.PI * 0.86, Math.PI * 0.14, false);
      ctx.quadraticCurveTo(3.4, -6.5, 0, 0);
      ctx.quadraticCurveTo(-3.4, -6.5, -5.28, -10.9);
      ctx.closePath();
      ctx.fillStyle = INK.pin;
      ctx.fill();
      ctx.beginPath(); ctx.arc(0, -12.5, 2.1, 0, 7);
      ctx.fillStyle = INK.pinCore;
      ctx.fill();
      if (!stamp) {
        ctx.font = "10px " + getComputedStyle(document.body).fontFamily;
        ctx.fillStyle = INK.label;
        ctx.textBaseline = "middle";
        ctx.fillText(c.code, 10, -12);
      }
      ctx.restore();
    };

    /* ---- rail ---- */
    const railButtons = railRef.current
      ? Array.from(railRef.current.querySelectorAll<HTMLButtonElement>("button"))
      : [];
    const segFills = railRef.current
      ? Array.from(railRef.current.querySelectorAll<HTMLElement>(".route-seg i"))
      : [];

    const jumpTo = (n: number) => {
      started = true;
      state.jump = { fromV: v3(state.cam.lon, state.cam.lat), toC: n, fromZoom: state.zoom, t: 0, dur: reduced ? 1 : 850 };
      for (let i = 0; i < 3; i++) {
        if (i < n) state.pinT[i] = Math.max(state.pinT[i], 99999);
        else if (i === n) state.pinT[i] = state.pinT[i] >= 0 ? Math.max(state.pinT[i], 99999) : -1;
        else state.pinT[i] = -1;
      }
      state.legP = [n >= 1 ? 1 : 0, n >= 2 ? 1 : 0];
      state.journeyFade = 1;
      state.seg = PIN_SEG[n];
      state.segTime = 0;
      state.intro = 1;
      setCaption(n);
    };
    const railHandlers = railButtons.map((b, i) => {
      const h = () => jumpTo(i);
      b.addEventListener("click", h);
      return h;
    });

    /* ---- sequencer ---- */
    const holdCity = (c: number) => {
      state.cam.lon = CITIES[c].lon;
      state.cam.lat = CITIES[c].lat;
    };
    const advance = () => {
      state.seg++;
      state.segTime = 0;
      if (state.seg >= SEGMENTS.length) {
        state.seg = 1; // loop: clean slate, story starts again at Delhi
        state.pinT = [-1, -1, -1];
        state.legP = [0, 0];
        state.journeyFade = 1;
      }
    };
    const step = (dt: number) => {
      if (!started) return;
      if (state.jump) {
        const j = state.jump;
        j.t += dt;
        const p = easeInOutCubic(Math.min(1, j.t / j.dur));
        const v = slerp(j.fromV, cityV[j.toC], p);
        const [lon, lat] = toLonLat(v);
        state.cam.lon = lon; state.cam.lat = lat;
        state.zoom = j.fromZoom + (zoomMax - j.fromZoom) * p;
        if (j.t >= j.dur) state.jump = null;
        return;
      }
      if (reduced) return; // static tableau
      const seg = SEGMENTS[state.seg];
      state.segTime += dt;
      const p = seg.dur ? Math.min(1, state.segTime / seg.dur) : 0;
      const e = easeInOutCubic(p);
      if (seg.t === "intro") {
        state.intro = p;
        state.zoom = 1;
      } else if (seg.t === "zoomIn") {
        holdCity(seg.c!);
        state.zoom = 1 + (zoomMax - 1) * e;
        setCaption(seg.c!);
      } else if (seg.t === "pin") {
        holdCity(seg.c!);
        state.zoom = zoomMax;
        if (state.pinT[seg.c!] < 0) state.pinT[seg.c!] = 0;
        state.pinT[seg.c!] += dt;
        setCaption(seg.c!);
      } else if (seg.t === "zoomOut") {
        holdCity(seg.c!);
        state.zoom = zoomMax - (zoomMax - 1) * e;
      } else if (seg.t === "transit") {
        state.zoom = 1;
        state.legP[seg.a!] = e;
        setTransitCaption(seg.a!, seg.b!);
        const v = legPoint(seg.a!, e);
        const [lon, lat] = toLonLat(v);
        state.cam.lon = lon; state.cam.lat = lat;
      } else if (seg.t === "return") {
        state.zoom = 1;
        state.journeyFade = Math.max(0, 1 - e / 0.7);
        clearCaption();
        const v = slerp(cityV[2], cityV[0], e);
        const [lon, lat] = toLonLat(v);
        state.cam.lon = lon; state.cam.lat = lat;
      }
      if (seg.dur && state.segTime >= seg.dur) advance();
      for (let i = 0; i < 3; i++) {
        if (state.pinT[i] >= 0 && !(seg.t === "pin" && seg.c === i)) state.pinT[i] += dt;
      }
    };

    const render = () => {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      setRotation(state.cam.lon, state.cam.lat);
      const reveal = reduced ? 1 : easeOutCubic(state.intro);
      ctx.save();
      if (reveal < 1) {
        ctx.globalAlpha = reveal;
        const s = 0.94 + 0.06 * reveal;
        ctx.translate(CX, CY); ctx.scale(s, s); ctx.translate(-CX, -CY);
      }
      drawSphere();
      strokePolylines(GRAT, stamp ? "rgba(24,20,12,0.04)" : INK.grat, 1);
      strokePolylines(LAND, INK.land, stamp ? 0.55 : 0.9);
      const seg = SEGMENTS[state.seg];
      for (let leg = 0; leg < 2; leg++) {
        const p = state.legP[leg];
        if (p <= 0) continue;
        const flying = seg.t === "transit" && seg.a === leg;
        const tip = drawRoute(leg, p, !flying && p >= 1);
        if (flying) drawComet(tip);
      }
      for (let i = 0; i < 3; i++) if (state.pinT[i] >= 0) drawPin(i, state.pinT[i]);
      drawRim();
      ctx.restore();
      segFills[0]?.style.setProperty("transform", `scaleX(${state.legP[0] * state.journeyFade})`);
      segFills[1]?.style.setProperty("transform", `scaleX(${state.legP[1] * state.journeyFade})`);
      const active = state.legP[1] > 0.99 || state.pinT[2] >= 0 ? 2 : state.legP[0] > 0.99 || state.pinT[1] >= 0 ? 1 : 0;
      railButtons.forEach((b, i) => b.classList.toggle("route-active", i === active));
    };

    /* ---- drivers ---- */
    let started = reduced;
    let last = performance.now();
    let lastFrameAt = 0;
    let raf = 0;
    let disposed = false;
    const tick = (now: number) => {
      if (disposed) return;
      lastFrameAt = now;
      const dt = Math.min(50, now - last);
      last = now;
      step(dt);
      render();
      raf = requestAnimationFrame(tick);
    };
    if (reduced) {
      // finished tableau
      state.intro = 1;
      state.pinT = [99999, 99999, 99999];
      state.legP = [1, 1];
      state.cam = { lon: CITIES[2].lon, lat: CITIES[2].lat };
      state.zoom = 1;
      setCaption(2);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { started = true; io.disconnect(); }
      },
      { threshold: 0.35 }
    );
    // The load intro (IntroZoomOut) may be flying the Earth into this corner
    // right now. If so, wait for its baton instead of starting underneath it,
    // and skip the fade-in: the intro already performed the reveal.
    const wIntro = window as unknown as { __originIntroRunning?: boolean };
    const takeBaton = () => {
      started = true;
      state.intro = 1;
      state.seg = 1;
      state.segTime = 0;
    };
    if (stamp && wIntro.__originIntroRunning) {
      window.addEventListener("origin-intro-done", takeBaton, { once: true });
    } else {
      io.observe(section);
    }
    raf = requestAnimationFrame((t) => { last = t; tick(t); });
    // some embedded webviews suspend rAF; a timer keeps the story playing
    const watchdog = window.setInterval(() => {
      const now = performance.now();
      if (now - lastFrameAt > 300) { last = now - 33; tick(now); }
    }, 33);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearInterval(watchdog);
      window.clearTimeout(swapTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("origin-intro-done", takeBaton);
      ro?.disconnect();
      io.disconnect();
      railButtons.forEach((b, i) => b.removeEventListener("click", railHandlers[i]));
    };
  }, []);

  if (stamp) {
    return (
      <a
        className="globe-mark"
        href={markHref}
        aria-label={markHref === "#top" ? "Back to the top" : "Back to the work"}
        ref={(el) => { sectionRef.current = el; }}
      >
        <div className="globe-mark-stage" ref={stageRef}>
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
      </a>
    );
  }

  return (
    <section
      className="scene route"
      id="route"
      aria-label="The route"
      ref={(el) => { sectionRef.current = el; }}
    >
      <div className="wrap route-grid">
        <div className="route-copy">
          <p className="eyebrow reveal">The route</p>
          <div className="route-cap reveal" ref={capRef} aria-live="polite">
            <span className="route-code" ref={codeRef}>
              01 · DEL
            </span>
            <h3 className="route-city" ref={cityRef}>
              New Delhi
            </h3>
            <p className="route-meta" ref={metaRef}>
              28.61° N · 77.21° E · India
            </p>
            <p className="route-line" ref={lineRef}>
              Born here.
            </p>
          </div>
          <div className="route-rail reveal" ref={railRef} role="group" aria-label="Journey chapters">
            <button aria-label="Chapter one, New Delhi">DEL</button>
            <span className="route-seg"><i /></span>
            <button aria-label="Chapter two, Dubai">DXB</button>
            <span className="route-seg"><i /></span>
            <button aria-label="Chapter three, Los Angeles">LAX</button>
          </div>
        </div>
        <div className="route-stage reveal" ref={stageRef}>
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
