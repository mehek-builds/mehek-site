// Computes node positions for the Record grid from the real item data and the
// real activity texture. Months flow left to right; four pillar rows top to
// bottom (brightest pillar on top). Nothing here is painted: item nodes come
// from items.ts, texture dots from activity.json (real git-log counts).
import { ITEMS, PILLARS, type Item, type Pillar } from "../content/items";
import activity from "../content/activity.json";

export const START = { y: 2024, m: 8 }; // Aug 2024, the record starts

function monthIndex(date: string): number {
  const [y, m] = date.split("-").map(Number);
  return (y - START.y) * 12 + (m - START.m);
}

// Total span: START → newest item month (inclusive), min 24 for breathing room.
const newest = ITEMS.reduce((mx, it) => Math.max(mx, monthIndex(it.date)), 0);
export const MONTHS = Math.max(newest + 1, 23);

// Row order: brightest pillar (ventures) on top → dimmest (content) on bottom.
const ROW_ORDER: Pillar[] = ["ventures", "inventions", "leadership", "content"];
export function pillarRow(p: Pillar): number {
  return ROW_ORDER.indexOf(p);
}
export function pillarLum(p: Pillar): number {
  return PILLARS.find((d) => d.key === p)!.lum;
}

export interface RecordNode {
  item: Item;
  mx: number; // month index
  row: number; // pillar row 0..3
  xFrac: number; // 0..1 across the plot
  yJit: number; // -1..1 vertical jitter within the row band to de-overlap
  litAt: number; // 0..1 scroll progress at which it lights
}

// Deterministic pseudo-jitter from the slug so SSR and client agree.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000; // 0..1
}

const sorted = [...ITEMS].sort((a, b) => a.date.localeCompare(b.date));

export const NODES: RecordNode[] = sorted.map((item, i) => {
  const mx = monthIndex(item.date);
  return {
    item,
    mx,
    row: pillarRow(item.pillar),
    xFrac: mx / (MONTHS - 1),
    yJit: hash(item.slug) * 2 - 1,
    litAt: i / sorted.length,
  };
});

// Background texture: real active days, sampled and capped. Non-interactive.
export interface TextureDot {
  xFrac: number;
  row: number;
  yJit: number;
  intensity: number;
}
export const TEXTURE: TextureDot[] = (() => {
  const days = (activity.days as { date: string; count: number }[]) ?? [];
  const out: TextureDot[] = [];
  for (const d of days) {
    const mx = monthIndex(d.date);
    if (mx < 0 || mx >= MONTHS) continue;
    const frac = (mx + hash(d.date) * 0.9) / (MONTHS - 1);
    // spread a few faint dots per active day across rows, scaled by commit count
    const n = Math.min(3, 1 + Math.floor(d.count / 20));
    for (let k = 0; k < n; k++) {
      out.push({
        xFrac: Math.min(1, frac),
        row: Math.floor(hash(d.date + k) * 4),
        yJit: hash(d.date + "y" + k) * 2 - 1,
        intensity: 0.1 + Math.min(0.22, d.count / 200),
      });
    }
  }
  return out.slice(0, 220);
})();

export const RECORD_BEATS = [
  { at: 0.0, text: "Aug 2024. Freshman at USC. The record starts." },
  { at: 0.2, text: "2025: built USC's first student VC program. 120 students." },
  { at: 0.4, text: "Sep 2025: Tonee, an AI texting tone detector. 100+ users in 8 weeks." },
  { at: 0.62, text: "May 2026: went full founder. An agency and a product a week." },
  { at: 0.85, text: "Today. Still shipping." },
];
