"use client";
// Scene 0 - the hero. Only the name and tagline. They sit almost invisible in
// the paper (a ghost) and are revealed in ink only where the moon's slow, cool
// light sweeps across (the .hero-lit-layer is masked to the moonlight). The
// ghost is real server-rendered text, so a plain fetch still returns the pitch.
// Everything else (numbers, contact, status) lives elsewhere on the site.
import HeroHarmonograph from "./HeroHarmonograph";

const NAME = "mehek mandal";
const TAG = "building products.";

function Title({ cls }: { cls: string }) {
  return (
    <h1 className={`hero-title ${cls}`}>
      <span>{NAME}</span>
      <span>{TAG}</span>
    </h1>
  );
}

export default function Hero() {
  return (
    <header className="scene hero" id="top">
      <HeroHarmonograph />
      {/* ghost: faint, always present (and the real SSR text) */}
      <div className="wrap hero-inner">
        <Title cls="ht-ghost" />
      </div>
      {/* lit: full ink, revealed only under the moonlight */}
      <div className="hero-lit-layer" aria-hidden="true">
        <div className="wrap hero-inner">
          <Title cls="ht-lit" />
        </div>
      </div>
      <a className="hero-cue" href="#flagships" aria-label="Scroll down">
        <span className="hero-cue-arrow">↓</span>
      </a>
    </header>
  );
}
