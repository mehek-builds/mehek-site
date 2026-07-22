// The single source of truth for the site. Grid nodes, receipts, the Work
// windows, the Leading scene, and every hero/scene count all derive from this
// file (see content/counts.ts). RULE: the site never states anything Mehek
// cannot back in a phone call. Every oneLiner IS a stranger-readable gloss;
// every proper noun in copy is either traditionally recognized or glossed.

// `content` was removed 2026-07-16 (Mehek): see the eviction note below. Keeping
// it in the union would let a future item quietly re-open the pillar.
export type Pillar = "ventures" | "inventions" | "leadership";

// Honest state of the thing. Drives the receipt state note and the hero counts.
// "role" = a position led/held (leadership orgs), not a shipped artifact.
export type Status =
  | "live" // deployed and currently running
  | "shipped" // built and reached users, not a maintained live URL
  | "client-engagement" // paid client work
  | "wound-down" // built, then deliberately ended
  | "role"; // a program/team led

export interface Item {
  slug: string;
  title: string;
  pillar: Pillar;
  oneLiner: string; // the gloss: says what this is to a stranger, in plain terms
  description: string;
  date: string; // YYYY-MM-DD, the day the node sits on
  end?: string;
  weight: 1 | 2 | 3 | 4;
  status: Status;
  // `source` (prototype 2026-07-15): a primary-source URL that proves this exact
  // number. When present, the metric renders as a dashed-underline ember link
  // ("this fact is checkable"): claims-as-receipts, the Calix pattern.
  metrics?: { label: string; value: string; source?: string }[];
  tech?: string[];
  links?: { label: string; url: string }[];
  makingOf?: string[]; // weight 3-4 only: real, dated, phone-call-backable process facts
  clientWork?: boolean; // feeds the Leading scene "[N] client systems" count
  watch?: string; // captured demo URL (fills over time; empty at v1)
  image?: string;
  // status "wound-down" only: the tombstone line Receipts.tsx renders. Kept
  // per-item (not a fixed literal in the component) so a second wound-down
  // venture doesn't inherit Traeco's copy by accident.
  tombstoneNote?: string;
  // Curation directive (Mehek, 2026-07-12): receipts are two-tier. "shelf"
  // renders a full receipt card (the five flagships + the Traeco tombstone,
  // ratified by Mehek); everything else defaults to a one-line ledger row.
  // Grid nodes and derived counts include BOTH tiers.
  tier?: "shelf" | "ledger";
  // Client work under NDA (e.g. the LetterStory console holds real lead data
  // and can never be linked or screenshotted). The receipt shows an NDA tag in
  // place of a live link, plus a short note. Publish-safety, not decoration.
  nda?: boolean;
  ndaNote?: string;
}

export interface PillarDef {
  key: Pillar;
  label: string;
  gloss: string;
  // Luminance step inside the single amber family (design law: one accent hue,
  // four brightness steps, the way GitHub uses four greens). 0 = dimmest.
  lum: number;
}

// One accent hue, four luminance steps: the one-accent law is never broken by
// the grid. Row position + label distinguish pillars; luminance distinguishes.
export const PILLARS: PillarDef[] = [
  { key: "ventures", label: "Ventures", gloss: "companies and client work with real money at stake", lum: 3 },
  { key: "inventions", label: "Inventions", gloss: "products and tools shipped, roughly one a week", lum: 2 },
  { key: "leadership", label: "Leading", gloss: "people, budgets, and programs led", lum: 1 },
];

export const ITEMS: Item[] = [
  {
    slug: "usc-aim-product-lead",
    title: "USC AIM product lead",
    pillar: "leadership",
    oneLiner: "Product lead for a campus mobile-ordering redesign.",
    description:
      "Product lead inside USC's Association of Innovative Marketing for a mobile-ordering redesign: 35 user interviews, 350 surveys, and a checkout A/B test that lifted completion 9.6%.",
    date: "2024-08-26",
    end: "2024-12-15",
    weight: 2,
    status: "role",
    metrics: [
      { label: "Completion lift", value: "+9.6%" },
      { label: "Team", value: "4 people" },
    ],
  },
  {
    slug: "vca-president",
    title: "Venture Capital Academy",
    pillar: "leadership",
    oneLiner: "Venture Capital Academy, USC's first student VC program.",
    description:
      "Built and led USC's first student venture capital program, from a blank page to a full cohort.",
    date: "2025-01-15",
    end: "2025-12-15",
    weight: 4,
    status: "role",
    metrics: [
      { label: "Students", value: "120" },
      { label: "Curriculum", value: "8 weeks" },
      { label: "Mentors + VCs", value: "25+" },
    ],
    makingOf: [
      "Designed an 8-week sourcing-and-diligence curriculum from scratch.",
      "Recruited 25+ mentors and investors to guest-teach.",
      "Organized Bay Area visits to Lightspeed, NEA, and Altos Ventures.",
      "Grew the first cohort to 120 students.",
    ],
  },
  {
    slug: "sofi-pm",
    title: "SoFi",
    pillar: "leadership",
    oneLiner: "SoFi, a consumer fintech: onboarding funnel work.",
    description:
      "Operator role at the consumer fintech SoFi: analyzed the onboarding funnel across 80K monthly signups, found the verification step as a 40% drop-off, and shipped research that fed a 15% retention improvement.",
    date: "2025-02-10",
    end: "2025-05-15",
    weight: 1,
    status: "role",
    metrics: [{ label: "Retention", value: "+15%" }],
  },
  {
    slug: "traeco",
    title: "Traeco",
    pillar: "ventures",
    oneLiner: "Traeco, an AI cost-visibility startup. Wound down.",
    description:
      "First startup: AI cost visibility for engineering teams. Ran the full founder loop of user research, positioning, and product. Wound down deliberately; the research corpus and instincts carry into every venture since.",
    date: "2025-03-03",
    weight: 2,
    status: "wound-down",
    tier: "shelf",
    tombstoneNote: "Wound down 2026. First startup; the lessons fund everything since.",
    links: [{ label: "Site", url: "https://traeco.dev" }],
  },
  {
    slug: "spark-sc-vp",
    title: "Spark SC",
    pillar: "leadership",
    oneLiner: "Spark SC, USC's student entrepreneurship org: ran the money.",
    description:
      "Ran finance and sponsorships for Spark SC, USC's student entrepreneurship org.",
    date: "2025-05-20",
    weight: 3,
    status: "role",
    metrics: [
      { label: "Sponsorships", value: "$14K" },
      { label: "Budget", value: "$27K" },
      { label: "Renewal", value: "40% → 71%" },
    ],
    makingOf: [
      "Rebuilt the sponsor pitch and pipeline across 7 sponsors.",
      "Managed a $27K budget across 12 events.",
      "Lifted sponsor renewal from 40% to 71% year over year.",
    ],
  },
  {
    slug: "cinematica-pm",
    title: "Cinematica Labs",
    pillar: "leadership",
    oneLiner: "Cinematica Labs, a founder mentorship program.",
    description:
      "Ran mentor-founder matching at Cinematica Labs, a founder mentorship program. NPS up 14 points over the summer.",
    date: "2025-06-10",
    end: "2025-08-15",
    weight: 3,
    status: "role",
    metrics: [
      { label: "Pods", value: "24" },
      { label: "Missed check-ins", value: "18% → 7%" },
    ],
    makingOf: [
      "Ran mentor-founder matching across 24 pods.",
      "Built an early-warning system that flagged 12 of 14 at-risk pairings.",
      "Cut missed check-ins from 18% to 7%.",
    ],
  },
  {
    slug: "tonee",
    title: "Tonee",
    pillar: "ventures",
    oneLiner: "Tonee, an AI texting tone detector.",
    description:
      "Founded and shipped an AI tone detector for texting, from a fine-tuned model to iOS deployment.",
    date: "2025-09-15",
    weight: 3,
    status: "shipped",
    metrics: [
      { label: "Users", value: "100+ in 8 weeks" },
      { label: "Latency", value: "2.3s → 0.1s" },
      { label: "Accuracy", value: "78% → 89%" },
    ],
    tech: ["Swift", "Core ML", "Python"],
    makingOf: [
      "Fine-tuned the tone model on 8,300+ annotations from 47 interviews.",
      "Migrated inference to Core ML, cutting latency from 2.3s to 0.1s.",
      "Shipped end to end, from model to iOS deployment.",
      "Raised accuracy from 78% to 89%.",
    ],
  },
  {
    slug: "fitness-tracker",
    title: "Fitness tracker",
    pillar: "inventions",
    oneLiner: "A health app with food-photo calorie scanning.",
    description:
      "Full health app: real HealthKit integration, GPT-4o and USDA food-photo scanning, and a FastAPI backend behind an Expo client.",
    date: "2025-12-05",
    weight: 2,
    status: "shipped",
    tech: ["FastAPI", "Expo", "HealthKit"],
    links: [{ label: "Code", url: "https://github.com/mehek-builds/fitness-tracker" }],
  },
  {
    slug: "hivemind",
    title: "HiveMind",
    pillar: "inventions",
    oneLiner: "HiveMind, a codebase knowledge-graph tool.",
    description:
      "Turns a codebase into a navigable knowledge graph: clustered communities, an HTML view, and an audit report. One of the pinned public repos.",
    date: "2026-02-14",
    weight: 2,
    status: "shipped",
    tech: ["Python"],
    links: [{ label: "Code", url: "https://github.com/mehek-builds/HiveMind" }],
  },
  {
    slug: "buildsmart",
    title: "BuildSmart",
    pillar: "ventures",
    oneLiner: "BuildSmart, an AI agency with live clients.",
    description:
      "Founded an AI agency on the cash track, with live client engagements.",
    date: "2026-05-12",
    weight: 4,
    status: "live",
    tier: "shelf",
    links: [{ label: "Live", url: "https://buildsmartagency.com" }],
    makingOf: [
      "Built a verified-contact outreach pipeline (Hunter + Reoon + Apollo).",
      "Engineered deliverability: DMARC, domain warmup, bounce control.",
      "A daily automation advances 10 net-new companies to send-ready.",
      "Live client engagements sold and delivered end to end.",
    ],
  },
  // EVICTED (Mehek curation directive 2026-07-12): creator-corpus and
  // g42-agent are out until they carry externally verifiable proof (plan §5
  // two-tier receipts, eviction rule). Restore from git history when they do.
  {
    slug: "graphify",
    title: "graphify",
    pillar: "inventions",
    oneLiner: "graphify, a tool that turns any input into a knowledge graph.",
    description:
      "Any input in; a clustered, navigable knowledge graph out.",
    date: "2026-06-08",
    weight: 3,
    status: "shipped",
    tech: ["Python"],
    makingOf: [
      "Parses code, docs, papers, or images into one knowledge graph.",
      "Clusters nodes into communities with an audit report.",
      "Outputs interactive HTML, used across the vault and codebases.",
    ],
  },
  {
    slug: "dubai-internship-tracker",
    title: "Dubai internship tracker",
    pillar: "inventions",
    oneLiner: "A live tracker of 61 verified Dubai roles.",
    description:
      "Live tracker of 61 verified Dubai roles with pay estimates and priority buckets, plus a weekday agent that re-verifies on employer application pages and redeploys itself.",
    date: "2026-06-12",
    weight: 2,
    status: "live",
    links: [{ label: "Live", url: "https://dubai-internship-tracker.vercel.app" }],
  },
  // EVICTED 2026-07-16 (Mehek): the "Build-in-public engine" item, and with it
  // the whole `content` pillar. "This does not need to be publicly said."
  // Naming the audience machinery (timed posting tuned to US builders, weekly
  // shoot batches) undercuts the work it describes. The channel speaks for
  // itself (2026-07-16: the footer's Instagram link is gone too; no
  // @mehek.builds anywhere on the site, the CTA is email).
  {
    slug: "icra-validator",
    title: "ICRA rationale validator",
    pillar: "ventures",
    oneLiner: "A rating-document validator for ICRA, an Indian credit rating agency.",
    description:
      "Flags discrepancies in a credit-rating rationale before it publishes, for ICRA, an Indian credit rating agency.",
    date: "2026-06-18",
    weight: 3,
    status: "live",
    clientWork: true,
    metrics: [
      { label: "Docs validated", value: "9" },
      { label: "False positives", value: "0" },
    ],
    links: [{ label: "Live", url: "https://icra-validator.vercel.app" }],
    makingOf: [
      "Claude extracts claims from a rationale PDF.",
      "Deterministic checks flag discrepancies with an audit trail.",
      "One-click swap fixes a flagged claim.",
      "Verified on 9 real rating docs with 0 false positives.",
    ],
  },
  {
    slug: "letterstory",
    title: "LetterStory engagement",
    pillar: "ventures",
    oneLiner: "An outreach system for LetterStory, a NYC dev-tools startup.",
    description:
      "A paid engagement for LetterStory, a NYC dev-tools startup: the full outreach system, from sourcing to a branded send console.",
    date: "2026-06-20",
    weight: 3,
    status: "client-engagement",
    clientWork: true,
    tier: "shelf",
    metrics: [
      { label: "Leads sourced", value: "651" },
      { label: "Passed the quality gate", value: "370" },
    ],
    makingOf: [
      "Sourced 651 Series A-C leads.",
      "Two-sided quality gate: rejects low-quality AND already-perfect.",
      "Double email verification (Hunter + Reoon).",
      "Shipped a branded outreach console for review and bulk send.",
    ],
    nda: true,
  },
  {
    slug: "upwork-sniper",
    title: "Upwork Sniper",
    pillar: "inventions",
    oneLiner: "A dashboard that scores freelance jobs and drafts proposals.",
    description:
      "A dashboard that finds the right freelance jobs and does the applying.",
    date: "2026-06-25",
    weight: 3,
    status: "live",
    links: [{ label: "Live", url: "https://upwork-sniper.vercel.app" }],
    makingOf: [
      "Scrapes 20 search terms every two hours.",
      "Scores jobs against a playbook and drafts proposals with Claude.",
      "Fills application forms with Playwright.",
    ],
  },
  {
    slug: "pead-system",
    title: "Earnings-drift trading system",
    pillar: "ventures",
    oneLiner: "A system that trades the drift after earnings announcements.",
    description:
      "Systems engineering applied to markets: an automated system for the post-earnings drift (PEAD).",
    date: "2026-06-29",
    weight: 3,
    status: "live",
    tier: "shelf",
    links: [{ label: "Dashboard", url: "https://pead-dashboard.vercel.app" }],
    makingOf: [
      "Event-driven signals off post-earnings drift.",
      "An 8-view operator dashboard with live updates.",
      "Research, backtest, and execution in one system.",
    ],
  },
  {
    slug: "goal-journal",
    title: "Goal Journal",
    pillar: "inventions",
    oneLiner: "A bullet-journal habit tracker for long-horizon goals.",
    description:
      "A bullet-journal-style habit tracker that maps 12 long-horizon goals to daily check-offs, with a spreadsheet Grid view.",
    date: "2026-07-01",
    weight: 2,
    status: "live",
    links: [{ label: "Live", url: "https://goal-bujo.vercel.app" }],
  },
  {
    slug: "kodecrafts",
    title: "KodeCrafts engagement",
    pillar: "ventures",
    oneLiner: "An Upwork qualification and application system for a dev agency.",
    description:
      "Client engagement: a qualification and application system for a dev agency's Upwork pipeline, reusing the Upwork Sniper architecture on a 3-hour scan cadence.",
    date: "2026-07-02",
    weight: 2,
    status: "client-engagement",
    clientWork: true,
    metrics: [{ label: "Scan cadence", value: "3h" }],
  },
  {
    slug: "rolequick",
    title: "Litos",
    pillar: "ventures",
    oneLiner: "Litos, a Chrome extension that autofills job applications.",
    description:
      "A job-application copilot: open a posting and it tailors the resume, fills the form, and drafts the outreach.",
    date: "2026-07-04",
    weight: 4,
    status: "live",
    tier: "shelf",
    metrics: [
      {
        label: "Distribution",
        value: "Chrome Web Store",
        source:
          "https://chromewebstore.google.com/detail/rolequick-tailored-resume/bdbedbmkjpfioknfpmhookefabipjaad",
      },
    ],
    links: [
      { label: "Live", url: "https://trylitos.com" },
      {
        label: "Store",
        url: "https://chromewebstore.google.com/detail/rolequick-tailored-resume/bdbedbmkjpfioknfpmhookefabipjaad",
      },
    ],
    makingOf: [
      "Published on the Chrome Web Store; answers every application question.",
      "Generates tailored resumes on the fly.",
      "A full 5-view product dashboard on a live backend.",
      "A cinematic marketing site with a baked scroll film.",
    ],
  },
  {
    // ADDED per master-plan items.ts delta rule 9 (missing from spec §8).
    slug: "rufescent",
    title: "Rufescent film site",
    pillar: "ventures",
    oneLiner: "A scroll-driven cinematic site for a Dubai members club.",
    description:
      "A scroll-driven cinematic website for a Dubai members club, where the scroll is the camera. Built on an in-house GSAP scrub engine with motion anchored on real location frames.",
    date: "2026-07-10",
    weight: 3,
    status: "live",
    clientWork: true,
    tier: "shelf",
    links: [{ label: "Live", url: "https://rufescent-site.vercel.app" }],
    makingOf: [
      "GSAP ScrollTrigger scrub engine: the scroll is the camera.",
      "Motion anchored on real location frames, not invented scenery.",
      "Per-segment lazy loading under a strict media budget.",
      "The same craft this founder site is built on.",
    ],
  },
];
