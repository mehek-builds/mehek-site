// Every headline number derives from items.ts here, so no count can ever drift
// from the receipts. NEVER hardcode these in a scene. Flag final values to
// Mehek before launch (§0 defaults).
import { ITEMS } from "./items";

// "Built things" = the ventures and inventions pillars (shipped artifacts).
// Leadership roles and content are not "shipped products".
const BUILT = ITEMS.filter((i) => i.pillar === "ventures" || i.pillar === "inventions");

export const COUNTS = {
  // Deployed products currently running (so live is a subset of shipped).
  live: BUILT.filter((i) => i.status === "live").length,
  // Everything built and shipped, since Aug 2024 (includes wound-down and client work).
  shipped: BUILT.length,
  // Leadership headline, from the VCA ledger (a single canonical claim, not a sum).
  studentsLed: 120,
  // Client systems shipped, for the Leading scene.
  clientSystems: ITEMS.filter((i) => i.clientWork).length,
  // Total real nodes on the Record grid.
  total: ITEMS.length,
} as const;

// The three hero numerals, in order, ready to render.
export const HERO_STATS = [
  { value: COUNTS.live, label: "live" },
  { value: COUNTS.shipped, label: "shipped" },
  { value: COUNTS.studentsLed, label: "students led" },
];
