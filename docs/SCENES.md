# Scenes (as built)

Composition in `app/page.tsx`, top to bottom:
Hero -> WorkCarousel -> Receipts -> Leading -> OriginGlobe (route) -> Person ->
NowFooter. Always-on overlays are mounted alongside: IntroZoomOut (first-load
intro), OriginGlobe `stamp` (the corner mark), StickyNav, SceneCaption, and Reveal;
plus CursorSnitch and FaviconGlobe from `app/layout.tsx`. The sticky nav, the scene
caption, and the corner globe appear after the hero and hide below 820px. Section
ids are in parentheses. See the repo `README.md` for the deep technical writeup of
each engine.

## 0. Hero (`Hero.tsx`, `HeroHarmonograph.tsx`) - id `top`
Only a name and a tagline, server-rendered as a faint ink "ghost" (the real SSR
text). A Canvas 2D harmonograph (a sum of slightly detuned sine pendulums, redrawn
each frame from a fixed-length trail buffer) draws a slow ink "moon" that carries a
pool of moonlight; the name is revealed in full ink only where the light sweeps
(the masked `.hero-lit-layer`, keyed off `--moon-x` / `--moon-y`). Hover brightens
and quickens the draw without changing the curve. Any letter key reseeds the figure.
Reduced motion: the figure is drawn once and parked, with the text lit.

## 1. The work (`WorkCarousel.tsx`) - id `flagships`
A continuously drifting carousel of "fake-live" product windows (device chrome + a
real screenshot poster from `public/work/`, the deployed URL as the one ember
element, and muted looping `.mp4` footage over the poster). The loop is seamless via
a duplicated half and driven by `requestAnimationFrame` (speed derived from the
measured half-width). It pauses on hover and is pointer-draggable (capture is taken
lazily only past a 6px threshold, so a plain click still opens the card link). The
"plus N more in the receipts below" hint derives from `counts.ts`. Reduced motion: a
plain scrollable row, with videos resting on their posters.

The section opens on `MoonTitle` ("Highlight reel"): the hero's moon, compressed to
one line (Mehek, 2026-07-16). The eyebrow and the old "N shipped projects so far"
line are both gone, so the scene is a single oversized kinetic line of ink on paper
per the title-card rhythm. The figure, moon, and trail tuning are shared with the
hero via `lib/harmonograph.ts`, so the two can never drift; only the amplitudes
differ (a line of type is a wide, shallow box, so `ax`/`ay` split where the hero
passes one amplitude twice). The ghost `<h2>` is the real server-rendered text and
the lit layer is an aria-hidden duplicate masked to the moonlight. Reduced motion:
full-ink title, no moon, no canvas.

**THE REEL IS THE SHELF** (Mehek ruling, 2026-07-16, which amends the 2026-07-12
curation directive): these six cards carry all card-level emphasis, so `Receipts`
renders only the remainder. `CARD_SLUGS` is exported here and filtered there, so
adding a card to the reel removes it from the receipts in the same commit.

## 2. The receipts (`Receipts.tsx`) - id `work`
PROOF-FIRST over the REMAINDER (Mehek ruling, 2026-07-16; supersedes the two-tier
shelf/ledger split, which the reel made redundant). The section renders only what the
reel does not carry (15 items today) and repeats nothing from it.

Each item leads with its strongest verified fact in ember display type, then the
name, the gloss, and the link row: DO #2, "one real outcome per artifact", built as a
layout. A second metric may ride alongside as context but renders subordinate, since
two facts at equal size read as two heroes. A "metric" is any verified fact, not just
a number (RoleQuick's was the value "Chrome Web Store" with a source link), and a
sourced fact becomes a checkable ember link. An item with NO metric cannot lead with
one, so it stays a one-line row under "The rest of the record" rather than opening on
an empty hero slot. A quiet state-and-date line closes each card.

Pillar filter chips write `?pillar=` into the URL, and `#item-slug` deep links scroll
to and flash a card. All server-rendered.

Consequences of the amendment, logged: the flagships' "How it was built" strips are
dropped for now (data still in `items.ts`, unrendered), and the Traeco tombstone plus
RoleQuick's Chrome Web Store proof no longer render anywhere. The last two are OPEN
and flagged to Mehek, not decided. Several receipt-card CSS classes
(`.receipt-desc`, `.receipt-making`, `.metric-sourced`, and friends) are orphaned
pending that decision.

## 3. Leading (`Leading.tsx`) - id `leading`
Three verb-first, compressed lines with one count-up each (VCA students, Spark $14K,
the BuildSmart client-systems count). No titles are rendered; each org name carries
its own gloss.

## 4. The route (`OriginGlobe.tsx`) - id `route`
The origin story as a looping ink globe (~25s): zoom into New Delhi ("Born here."),
drop a pin, pull back to the whole map, fly to Dubai ("Raised here."), then take the
long way west to Los Angeles ("Continuing building."), then glide home and loop.
Hand-rolled Canvas 2D sphere (orthographic projection, back-face cull, slerp
great-circle legs) over Natural Earth coastlines (`lib/land-arcs.ts`); a declarative
list of timed segments drives it; captions and a clickable DEL / DXB / LAX chapter
rail update as it plays; ember is reserved for the pins and the flight line. Starts
on an IntersectionObserver; reduced motion gets the finished tableau.

The same component, passed `stamp`, renders the quiet non-zooming corner logomark
(fixed top-left, an `<a href="#top">` back-to-top control, hidden below 820px). On
first load it can take a baton from IntroZoomOut instead of starting underneath it.

## 5. The person (`Person.tsx`) - id `person`
A headshot with a restrained cursor-reactive tilt (static on touch and under reduced
motion), an honest note (a DRAFT until Mehek approves it), a texture line, and a badge.

## 6. Now + colophon (`NowFooter.tsx`, `NowRotator.tsx`, `Terminal.tsx`) - id `now`
The live Now widget bakes from `now.json` (21-day anti-rot: past 21 days it degrades
to a still-true "Latest ship" line from the newest dated item), plus a rotating
present-tense status line, two CTAs, and the colophon with social links. Easter egg:
press `/` for a mini terminal (help / stack / now / clear), its output derived from
real data.

## First-load intro (`IntroZoomOut.tsx`)
The mirror of the route's zoom-in: on first load the Earth sits center-screen, the
camera pulls back through hairline orbit rings past a sun-glow while stars gather,
then the small Earth glides in one clean line into the corner and lands on the stamp
(an `origin-intro-done` event is the baton). Runs once per session (sessionStorage);
any click, wheel, key, or touch skips it; reduced motion, deep links, and sub-820px
viewports skip it entirely; a hard 6.5s failsafe guarantees the cover can never stick.
