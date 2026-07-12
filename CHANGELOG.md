# Changelog

## 2026-07-12 — RoleQuick store link + design-plan alignment pass

- **RoleQuick** is now published on the Chrome Web Store (confirmed live): added
  the Store link + "Distribution: Chrome Web Store" metric to its receipt, updated
  the Work window beat and the making-of line.
- **Craft alignment** against the design plan's carry-over rules: replaced the
  banned bare CSS `ease` keyword with named curves (`--ease-reveal`/`--ease-ui`)
  on every transition; added `text-wrap: balance` on headings and `text-wrap:
  pretty` on body (widow/orphan control); `font-kerning: normal`; purged the last
  dark-era amber values in favor of the ember token.

## 2026-07-12 — Rebuild: "Proof carries the color" (Phases B-F, on `rebuild` branch)

Full cinematic rebuild per the master plan. The old GitHub-profile shell is
demolished (survives in git history); the data layer was kept and extended.

**Added**
- Light "Proof carries the color" design system (`globals.css`, `scenes.css`): near-white paper
  canvas, one amber accent reserved for verified facts, Space Grotesk display +
  system text, global grain+vignette grade, node motif, glass receipts.
- Seven scenes: Hero (kinetic reveal + count-ups + ambient grid backdrop), The Bet
  (pinned origin), The Record (pinned scrubbed timeline of every real item, with an
  interactive deep-linkable node index), Receipts (glass evidence cards + pillar
  filters + `#item-slug`), The Work (four flagship product windows), Leading
  (count-up lines), The Person (headshot tilt + honest note), Now + colophon +
  terminal easter egg. Sticky section nav.
- Data layer: `items.ts` extended (status / clientWork / makingOf / watch),
  Rufescent added, every oneLiner rewritten as a stranger-gloss, PEAD de-acronymed;
  `counts.ts` (all numbers derive from items), `now.ts` (21-day anti-rot).
- Motion engine: `lib/gsap.ts`, `lib/motion.ts`, `lib/visible.ts` (background-tab
  guard so throttled rAF never freezes content hidden). GSAP added.
- In-repo docs: ARCHITECTURE, SCENES, DECISIONS.

**Verified**
- Production build passes (static prerender, no TS/lint/SSR errors).
- Plain `curl` returns the full server-rendered pitch of every scene.
- Hero renders 8 live / 16 shipped / 120 students led, all derived from items.ts.

**Next**
- Real screenshots into `public/work/` + `public/og.png`; PostHog; perf trim to
  <150 kB; qa-motion-recorder gate; a11y/mobile pass (Phase F).
- Mehek sign-off on items.ts + honest note before merging `rebuild` into `main`.

## 2026-07-12 — Expressive display face (Fraunces)

- Swapped the display face from Space Grotesk to **Fraunces** (variable editorial
  serif with the optical-size axis) — the creative voice. Reserved for big
  editorial type only: headings, title cards, hero, the Record count line and
  narrative beats, the Leading statements, and the ember numerals. Every small
  functional label (eyebrows, buttons, chips, tags, dates, nav, terminal) moved
  to the quiet neutral sans. Disciplined two-face system per plan §5.

## 2026-07-12 — Scene 3 windows play on hover (live clips)

- The three motion-driven windows (RoleQuick, BuildSmart, Rufescent) now hold a
  short muted scroll-through **clip** of the real site, recorded via Playwright
  and compressed to small mp4s (192-480KB each). The window plays the clip on
  hover/focus and resets to the screenshot poster at rest; reduced-motion and
  touch keep the static poster. The PEAD dashboard stays a still. Total Scene 3
  media ~1.4MB, within budget.
