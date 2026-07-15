# mehek-site

A hand-built cinematic founder site: one URL that, in under ten seconds, makes a cold visitor believe "this person invents, ships, and leads at an unusual rate, with the craft to prove it," and then lets them verify every claim against receipts.

This is not a template reskin and not a page builder. It is a statically prerendered Next.js 15 / React 19 / TypeScript single-page app whose signature moments all run on bespoke, hand-written code rather than off-the-shelf libraries: a live ink harmonograph that draws the hero name as a cool pool of "moonlight" sweeps across it, a three-city origin globe rendered from scratch on a 2D canvas with real Natural Earth coastlines and great-circle flight paths, that same globe spun into the browser-tab favicon a frame at a time, a load-time zoom-out that flies the Earth into the corner mark, a pointer-draggable product carousel with hover-to-play footage, and a two-tier evidence index. Underneath sits a single-source-of-truth TypeScript data layer (every headline number is derived, never typed), a ~1,400-line hand-written CSS design system with exactly one accent color, GSAP with ScrollTrigger and a shared motion-token set in the engine layer, and a reduced-motion static twin behind every animated thing. There is no 3D library, no animation framework driving the scenes, and no CSS framework anywhere.

Live: https://mehek-site.vercel.app (served publicly at mehekmandal.com).

---

## The problem this solves

A founder's site has a strange, unforgiving job. It has to convince three different audiences at once, in the first few seconds, without a shared vocabulary between them:

1. **Investors** want to see traction, judgment, and range, fast, and they are pattern-matching against a thousand other decks and sites.
2. **Potential co-founders and hires** want to know what it feels like to build alongside this person, and whether the craft is real or borrowed.
3. **Clients** want proof that the work ships and holds up.

Most personal sites fail all three the same way. They reach for a template, so the visitor's very first subconscious read is "this looks like everyone else's," which is fatal for someone whose entire claim is that they are *not* like everyone else. Or they overcorrect into a wall of animation that buries the substance, so a busy reader bounces before reaching a single fact. Or they state numbers the person cannot actually back up, and one skeptical question collapses the whole thing.

So the real problem is not "make a nice website." It is: **present a large, fast-moving body of real work memorably and honestly, prove the craft in the medium itself, and never state a claim the founder cannot defend in a phone call, all while staying readable to a stranger and a crawler with JavaScript turned off.** That set of constraints pulls in opposite directions, and resolving them is where the engineering lives:

- **Distinctiveness vs. readability.** The site has to look and move like nothing else, yet the pitch must be reachable in one scroll and legible without the motion. The resolution here is that every animated layer is an *enhancement* over server-rendered HTML that already says everything. A plain `curl` returns the full pitch of every scene.
- **Craft has to be demonstrated, not asserted.** Anyone can write "strong front-end skills." This site instead renders a globe, a harmonograph, and an animated favicon from first principles, on a 2D canvas, with no 3D or animation library to lean on. The medium is the evidence.
- **Truth has to be structurally enforced, not promised.** If the hero says "16 shipped" and a receipt is added or removed, the number has to move on its own or the site will eventually lie. That means counts are *derived from data*, never hardcoded in a scene.
- **It cannot rot.** A live founder ships constantly; a "Now" widget that goes stale is worse than none. So staleness is handled in code: past a threshold the widget degrades to a still-true line.
- **It has to survive the real web.** Background tabs throttle animation timers, embedded webviews suspend them entirely, users request reduced motion, screen readers and crawlers need text. Each of those is a way for a naive animated site to freeze half-drawn or go blank, and each is handled explicitly here.

**mehek-site is an attempt to satisfy all of those constraints as one system** rather than a pretty page that satisfies the first and quietly breaks the rest.

## Why you should care (even if you never hire a founder)

If you are reading this to understand what the builder can do, here is the short version. This repository takes a deceptively soft brief ("a personal site") and treats it as a real front-end rendering problem. It hand-rolls the math for an orthographic globe (sphere projection, back-face culling, spherical-linear-interpolated great-circle routes), draws a harmonograph as a live sum of slightly detuned sine pendulums with a fixed-length trail buffer, animates a favicon by rasterizing a canvas to a PNG data URI every frame because browsers refuse to animate icon files, and does all of it with a strict discipline most "cinematic" sites skip: a static, fully-readable twin behind every effect, counts that cannot drift from their evidence, and graceful degradation for reduced motion, background tabs, suspended webviews, and no-JS crawlers. The interesting part is not any one animation. It is that expressive motion and engineering rigor are held together at the same time, which is exactly the thing a founder's site is supposed to prove.

---

## System architecture

Everything the visitor reads is server-rendered HTML. The motion layer hydrates on top and only enhances; it can be removed entirely and the site still delivers its full pitch. Scene order and composition live in one file (`app/page.tsx`); persistent chrome lives in `app/layout.tsx`; every scene reads from the data layer and is forbidden from inventing its own numbers.

```
   Browser tab      ┌─────────────────────────────────────────────────────┐
   icon             │ FaviconGlobe: ink globe drawn to a 64px offscreen    │  canvas → PNG
                    │ canvas, swapped into <link rel=icon> as a PNG each    │  data-URI,
                    │ frame. Static twin = inline SVG icon (no-JS / reduced)│  ~15 fps, paused when hidden
                    └───────────────────────────▲─────────────────────────┘
                                                │
   app/layout.tsx   fonts (Instrument Serif + local General Sans) · metadata/OG ·
                    .grade film overlay · CursorSnitch · FaviconGlobe · .js flag script
                                                │
   app/page.tsx     server-rendered scene composition (the readable baseline)
   ┌────────────────────────────────────────────────────────────────────────┐
   │ IntroZoomOut → OriginGlobe(stamp) → Hero → WorkCarousel → Receipts →    │
   │ Leading → OriginGlobe(route) → Person → NowFooter                       │
   │ overlays: StickyNav · SceneCaption · Reveal                             │
   └───────────────────────────────▲────────────────────────────────────────┘
                                   │  scenes read data, never hardcode it
   Data layer (one source of truth)
   content/items.ts ──► content/counts.ts        (every hero + scene number derives here)
         │              content/now.json ──► content/now.ts   (21-day anti-rot Now state)
         │              content/activity.json                 (real git-log day counts)
   Engine layer
   lib/gsap.ts (register ScrollTrigger once) · lib/motion.ts (one motion-token set) ·
   lib/visible.ts (background-tab visibility gate) · lib/land-arcs.ts (Natural Earth coastlines)
   Rendering primitives: hand-rolled Canvas 2D · requestAnimationFrame · IntersectionObserver ·
   ResizeObserver · CSS transitions · prefers-reduced-motion static twins
```

The three globes (the load intro, the route scene plus its corner-stamp variant, and the tab favicon) are three separate components that deliberately share the *same* sphere math and the *same* coastline dataset, so the mark reads as one object across the whole experience. A small event handshake (`window.__originIntroRunning` plus an `origin-intro-done` event) lets the load-time zoom-out hand its finished Earth to the persistent corner globe instead of both drawing over each other.

---

## The full stack

| Layer | Technologies |
|-------|--------------|
| **Framework & language** | Next.js 15.3.3 (app router), React 19.1.0, React DOM 19.1.0, TypeScript 5 (`strict`), path alias `@/*` |
| **Rendering technique** | Hand-rolled HTML5 Canvas 2D: orthographic globe projection with back-face culling, spherical linear interpolation (slerp) for great-circle flight legs, a harmonograph (sum of detuned sine pendulums) with a fixed-length trail buffer, an animated favicon rasterized to a PNG data URI each frame, an inline-SVG cursor follower |
| **Geodata** | Natural Earth 110m coastlines decoded from world-atlas TopoJSON into flat `lon*10 / lat*10` polylines (`lib/land-arcs.ts`), plus a computed graticule |
| **Motion engine** | GSAP 3.15.0 with ScrollTrigger, registered once in `lib/gsap.ts`; a single motion-token set in `lib/motion.ts` (named eases, durations, one spring). The scenes themselves animate on bespoke `requestAnimationFrame` loops, `IntersectionObserver`, `ResizeObserver`, and CSS transitions |
| **Styling** | Hand-written CSS with custom-property design tokens (`app/globals.css` + `app/scenes.css`, ~1,400 lines total). No CSS framework. One "ember" accent with four luminance steps, a fixed SVG-noise "film grade" overlay |
| **Typography** | Instrument Serif via `next/font/google` (editorial display), General Sans as a local variable `.woff2` via `next/font/local` (body + labels), system monospace for verified-fact labels |
| **Data layer** | TypeScript single source of truth (`content/items.ts`), derived counts (`content/counts.ts`), a 21-day anti-rot Now state (`content/now.ts` + `content/now.json`), real git-activity day counts (`content/activity.json`) |
| **Build-time** | `next build` static prerender; build date frozen into `NEXT_PUBLIC_BUILD_DATE` via `next.config.mjs` so server render and client hydration agree on "now" |
| **Resilience & a11y** | Server-rendered text baseline, `prefers-reduced-motion` static twin on every animated element, background-tab visibility gating (`lib/visible.ts`), `requestAnimationFrame` watchdog timers for suspended webviews, `sessionStorage` intro guard, `aria-hidden` on decorative canvases |
| **Tooling** | `scripts/build-activity.mjs` (Node git-log aggregator), `scripts/qa-motion-recorder.js` (Playwright 1.61.1 motion QA gate) |
| **Deploy** | Vercel git-integration push-deploy; production at mehek-site.vercel.app, custom domain mehekmandal.com |

---

## The hero: a harmonograph drawn in moonlight (`components/HeroHarmonograph.tsx`, `components/Hero.tsx`)

The hero renders only a name and a tagline, and they are almost invisible in the paper by default. A single ink "moon" slowly traces a harmonograph across the canvas and carries a cool pool of light with it; the name is revealed in full ink only where that light sweeps past.

The curve is a genuine harmonograph: `x` and `y` are each the sum of two sine terms whose frequencies are picked as small near-integers (3, 4, or 5) and then *detuned* by a tiny random amount, so the figure precesses slowly and never exactly repeats. Because a harmonograph is mathematically space-filling, a naive fade-out trail can never keep it sparse (the code comments document measuring this: exponential-decay "comet trails" settle at ~6 to 7% canvas coverage and have a knife-edge bifurcation that is impossible to tune). The solution is a **fixed-length trail buffer**: only the last `MAX_TRAIL` (600) points are ever drawn, redrawn from a full `clearRect` every frame, alpha tapering per segment from the moon's head to zero at the tail. That turns "how much of the figure is visible" into an exact point count instead of a threshold to chase.

The canvas is intentionally *not* matched to `devicePixelRatio` (`dpr = 1`), so the browser upscales the bitmap on retina displays and softens the stroke into a hazy hairline that a crisp dpr-matched canvas cannot reproduce. Hovering the hero eases a `hover` value from 0 to 1 that only brightens the moonlight and quickens the draw; it never touches the curve's shape, so the stroke can never fragment mid-draw. The moon's position is published to CSS custom properties (`--moon-x`, `--moon-y`) on the `.hero` element, which is what the masked lit-text layer keys off. The real name and tagline are server-rendered as a faint "ghost" (`.ht-ghost`), so a plain fetch and a reduced-motion visitor both get the actual text; under reduced motion the figure is drawn once and parked. Pressing any letter key reseeds the pendulums to a new figure.

## The origin globe: one engine, three mountings (`components/OriginGlobe.tsx`, `components/IntroZoomOut.tsx`, `components/FaviconGlobe.tsx`, `lib/land-arcs.ts`)

The globe is drawn from scratch on a 2D canvas. There is no Three.js and no WebGL anywhere in the project. All three globe surfaces share the same primitives:

- **Sphere math.** Longitude/latitude are converted to 3D unit vectors; an orthographic projection rotates points into the current camera frame and keeps only the front hemisphere (`z > 0.005`), which is the back-face cull. `slerp` (spherical linear interpolation) walks the flight paths so routes follow great circles rather than straight screen lines.
- **Real geography.** `lib/land-arcs.ts` is Natural Earth 110m coastline data, decoded from world-atlas TopoJSON into flat `lon*10 / lat*10` polyline arrays and precomputed once into typed arrays of `sin`/`cos` latitude. The graticule (meridians and parallels) is generated in code.

`OriginGlobe.tsx` is the flagship. As the route scene it plays a roughly 25-second looping origin story: zoom into New Delhi ("Born here."), drop a pin, pull back to the whole map, fly to Dubai ("Raised here."), then take the long way west across Turkey, Paris, the Atlantic and New York to Los Angeles ("Continuing building.") so the distance actually reads, then glide home and start over. The sequence is a declarative array of timed segments (`intro`, `zoomIn`, `pin`, `zoomOut`, `transit`, `return`) driven by a delta-time stepper; captions and a clickable chapter rail (DEL / DXB / LAX) update imperatively as it plays; a flying "comet" tip leads the drawn route and pins drop with an easing bounce and an expanding ring. The ember accent is reserved for the pins and flight line only, because places-lived are verifiable facts.

The same component, passed `stamp`, renders a smaller, quieter, non-zooming version fixed to the top-left corner as the site's persistent logomark (an `<a href="#top">` back-to-top control that hides below 820px). On first load, `IntroZoomOut.tsx` covers the page and does the *mirror* move: the Earth sits center-screen on the paper, the camera pulls back through hairline orbit rings past a warm sun-glow while 120 deterministic pseudo-random stars gather toward the top-left, then the small Earth glides in one clean line into the corner and lands exactly on the stamp, which takes over the loop. It runs once per session (guarded by `sessionStorage`), any input skips it, deep links and sub-820px viewports and reduced-motion skip it entirely, and a hard 6.5-second failsafe guarantees the cover can never stick.

`FaviconGlobe.tsx` solves a genuinely annoying constraint: Chrome will not animate a GIF or APNG favicon (it freezes on frame one). So the only way to actually move the tab icon is to draw the globe to a tiny offscreen canvas each frame and swap the `<link rel="icon">` href to a fresh PNG via `canvas.toDataURL`. It reuses the same coastline data and paper/ink treatment, bumps contrast so it survives at 16px, spins about one revolution every 24 seconds at ~15fps, and pauses while the tab is hidden. Its static twin is the server-rendered inline-SVG icon in `app/layout.tsx`, which is what no-JS, crawlers, and reduced-motion visitors keep.

Two shared robustness patterns run through all three: an `IntersectionObserver` starts the route animation only when it scrolls into view, and a `setInterval` watchdog re-drives the render loop if `requestAnimationFrame` has been suspended for more than 300ms (as embedded webviews do).

## The work carousel (`components/WorkCarousel.tsx`)

Every flagship product is a "fake-live" window: device chrome, a real screenshot poster from `public/work/`, the deployed URL shown as the one ember element in the frame, and short muted product footage (`.mp4`) that loops over the poster. The track drifts left forever via a duplicated half for a seamless wrap, driven by a `requestAnimationFrame` loop (not a CSS marquee) whose speed is derived from the measured half-width so the pace is identical at any card size. It pauses on hover so the links are clickable and supports pointer dragging, with a deliberate subtlety documented in the code: the pointer is *not* captured on pointer-down, because `setPointerCapture` would retarget the follow-up click away from the card link; capture is taken lazily only once movement exceeds a 6px threshold, and a real drag suppresses the click so a drag never accidentally opens a link. Under reduced motion the whole thing degrades to a plain scrollable row and the videos rest on their poster frames.

## The receipts: a two-tier evidence index (`components/Receipts.tsx`)

Below the work sits the proof. It renders in two tiers by design: a curated "shelf" of full receipt cards (state note, date, gloss, description, metric chips, a "How it was built" strip, tech tags, and proof-ordered links) and, under "The rest of the record," one-line ledger rows (date, name, gloss, and a single proof) for everything else. Sourced metrics render as checkable ember links ("verify"), wound-down work gets a per-item tombstone line, and NDA client work shows an "available upon request" tag instead of a link. Pillar filter chips write `?pillar=` into the URL, and `#item-slug` deep links scroll the target card into view and flash it. Every receipt is server-rendered, so the entire evidence set is present without JavaScript.

## The data layer: numbers that cannot drift (`content/items.ts`, `content/counts.ts`, `content/now.ts`)

`content/items.ts` is the single source of truth. Each item is a typed record (slug, pillar, a stranger-readable one-line gloss, description, date, status, weight, optional metrics/tech/links/making-of, curation `tier`, NDA flags). `content/counts.ts` derives every headline number from that array: `live` and `shipped` are filters over the ventures and inventions pillars, `clientSystems` counts items flagged `clientWork`, `total` is the array length. No scene is allowed to hardcode a count, so adding or removing a receipt automatically moves every number that references it and the site cannot silently lie.

`content/now.ts` reads `content/now.json` and applies a **21-day anti-rot rule**: if the Now file is older than three weeks at build time, the widget stops asserting "currently building X" and degrades to a still-true "Latest ship" line pulled from the newest dated item. Critically, "now" is not `new Date()` at render time; it is frozen into `NEXT_PUBLIC_BUILD_DATE` at `next build` (via `next.config.mjs`) so the server prerender and the client hydration agree and never mismatch the staleness check. `content/activity.json` holds real per-day work counts (see the build tooling below) used only as background grid texture, so even the ambient density traces to logged work rather than being painted in.

## Resilience, accessibility, and the "static twin" discipline (`lib/visible.ts`, `app/layout.tsx`)

The through-line of the whole codebase is that the animated version is always a strict enhancement over a readable static one:

- **Server-rendered text is the baseline.** The hero name, every receipt, the Leading lines, and the Now widget are real HTML. A `curl` returns the pitch.
- **A `.js` class is only added when motion is allowed.** An inline script in `app/layout.tsx` adds it synchronously unless `prefers-reduced-motion` is set, so the reduced-motion static twin never flashes and all reveal/count-up behavior falls back to a fully lit, static state.
- **Background tabs never freeze content half-drawn.** `lib/visible.ts`'s `whenVisible()` defers entrance and count-up setup until the tab is actually visible, because a tab that loads in the background gets throttled `requestAnimationFrame` and would otherwise strand content in a hidden mid-animation state. The DOM's default (no-JS) state is always the finished, readable one.
- **Suspended webviews are watched.** The globe components run watchdog timers that re-drive the loop if rAF stalls.
- **Decorative canvases are `aria-hidden`,** and interactive motion (the cursor snitch, the headshot tilt) is disabled on touch and under reduced motion where it would be meaningless or costly.

## Smaller delights

- **CursorSnitch (`components/CursorSnitch.tsx`)** replaces the system cursor with a hand-drawn inline-SVG golden snitch that eases toward the real pointer with lag (not a snap) while its feathered wings beat on a CSS loop. Off on touch and under reduced motion; never intercepts clicks.
- **Terminal easter egg (`components/Terminal.tsx`)** opens on `/` and answers `help`, `stack`, `now`, and `clear`, with `now` and `stack` derived from the same real data the rest of the site uses.
- **SceneCaption + NowRotator + StickyNav (`components/*`)** are information-bearing motion: a fixed mono caption that rewrites itself per scene, a status line that rotates only through present-tense lines that are true at build time, and a sticky progress nav that always allows instant anchor jumps and never blocks on animation.
- **CountUp and Reveal (`components/*`)** animate numbers and entrances via `IntersectionObserver`, but server-render the true final value so the real number is present immediately for no-JS and reduced-motion.

## Design system (`app/globals.css`, `app/scenes.css`)

"Proof carries the color." The canvas is warm near-white paper (`--bg: #f7f5f0`), type is quiet ink (`--text: #1b1a17`), and there is exactly one accent: ember (`--amber: #d9660a`), reserved for verified facts and live signals (numbers, live nodes, the Now chip, the globe pins) and never used on chrome, headings, or decoration, so a visitor learns "ember = real" without being told. The four content pillars are distinguished only by four luminance steps within that single hue (`--lum-0` through `--lum-3`), never by new colors. Only two named easing curves are allowed (`--ease-reveal`, `--ease-ui`); the bare CSS `ease` keyword is banned as a craft rule. A single fixed "film grade" overlay (a faint SVG fractal-noise grain plus a warm radial tint, pointer-transparent) unifies the scenes into one continuous gallery. All of this is roughly 1,400 lines of hand-written CSS with no framework.

---

## Running it

```bash
npm install
npm run dev        # Next dev server (the repo's .claude/launch.json maps it to port 3012)
npm run build      # production build (static prerender)
npm run start      # serve the production build
```

Regenerate the real git-activity texture that backs the ambient grid:

```bash
npm run activity   # scripts/build-activity.mjs → content/activity.json
```

`scripts/build-activity.mjs` walks local repositories under `~/Documents` (to a depth of two), reads each one's `git log` dates, and writes per-day commit counts to `content/activity.json`. The rule it enforces is that the site's background density traces to real logged work, never to painted-in decoration.

## Testing: the motion QA gate

```bash
npm run qa:motion  # scripts/qa-motion-recorder.js [baseURL]
```

`scripts/qa-motion-recorder.js` launches real Chromium with Playwright and asserts the site's motion non-negotiables against a running dev server: that the hero harmonograph canvas signature actually changes over two seconds (it is animating, not stuck), that under `prefers-reduced-motion` the same canvas is parked static *and* the hero still exposes real visible text (the accessible twin is intact), that a scroll-scrub scene lights progressively and monotonically as you scroll rather than jumping straight to fully-lit or staying at zero, and that the work-window videos start paused on their poster frame, play on hover, and reset when the cursor leaves. It exits non-zero with a labeled `[FAIL]` line on any regression.

## Deploy

The site builds with `next build` and deploys on Vercel via git integration (this repo push-deploys, verified against the in-repo docs). Production is served at mehek-site.vercel.app and publicly at mehekmandal.com. `app/layout.tsx` sets the canonical URL, Open Graph, and Twitter card metadata (share image at `public/og.png`).

## Scope

**In:** a single scroll-driven page, fully server-rendered and readable without JavaScript, with a bespoke Canvas 2D motion layer, a derived-count data layer, and reduced-motion and no-JS fallbacks throughout. **Deliberately out:** any CMS or backend (the data layer is typed source files), any 3D or animation library (the globes and harmonograph are hand-rolled Canvas 2D), and any CSS framework (the design system is hand-written). The site is meant to be edited by adding one object to `content/items.ts` and updating `content/now.json`; everything downstream derives from those.
