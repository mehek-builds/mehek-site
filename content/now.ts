// Reads now.json and applies the anti-rot rule: if the file is older than 21
// days at build time, the widget degrades to a still-true "Latest ship" line
// pulled from the newest dated items.ts entry.
import nowData from "./now.json";
import { ITEMS } from "./items";

export interface NowState {
  stale: boolean;
  building?: { name: string; gloss: string };
  lastShip: { name: string; gloss: string; date: string; url?: string };
  post?: { label: string; url: string };
}

const STALE_DAYS = 21;

function newestItem() {
  return [...ITEMS].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getNow(buildDate: string): NowState {
  const updated = new Date(nowData.updated + "T00:00:00Z").getTime();
  const now = new Date(buildDate + "T00:00:00Z").getTime();
  const ageDays = (now - updated) / (1000 * 60 * 60 * 24);

  if (ageDays > STALE_DAYS) {
    const n = newestItem();
    return {
      stale: true,
      lastShip: { name: n.title, gloss: n.oneLiner, date: n.date, url: n.links?.[0]?.url },
    };
  }
  return {
    stale: false,
    building: nowData.building,
    lastShip: nowData.lastShip,
    post: nowData.post,
  };
}

// Baked into the bundle at `next build` time via next.config.mjs (not
// recomputed per-render), so server prerender and client hydration always
// agree on "now" for the staleness check.
export const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE as string;
