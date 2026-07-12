"use client";
// Scene 3 — THE WORK. Four curated flagships, each a fake-live product window
// (device chrome + real screenshot). Two actions each: Open live + The receipt.
// The footage in the window is the demo; the click-through is the proof.
import { useEffect, useRef } from "react";
import { ensureGsap } from "../lib/gsap";
import { whenVisible } from "../lib/visible";

interface Win {
  slug: string; // receipt anchor
  name: string;
  gloss: string;
  url: string; // "open live"
  urlLabel: string;
  poster: string;
  video?: string; // muted scroll-through clip; plays on hover. Poster shows at rest.
  beats: string[];
}

const WINS: Win[] = [
  {
    slug: "rolequick",
    name: "RoleQuick",
    gloss:
      "Autofills job applications: a Chrome extension, resume generation, and a full product dashboard.",
    url: "https://role-quick-website.vercel.app",
    urlLabel: "role-quick-website.vercel.app",
    poster: "/work/rolequick.jpg",
    video: "/work/rolequick.mp4",
    beats: ["On the Chrome Web Store", "Resume generation", "5-view dashboard"],
  },
  {
    slug: "buildsmart",
    name: "BuildSmart / Elemental",
    gloss: "An AI agency with live clients. Systems that source, verify, and send.",
    url: "https://buildsmartagency.com",
    urlLabel: "buildsmartagency.com",
    poster: "/work/buildsmart.jpg",
    video: "/work/buildsmart.mp4",
    beats: ["651 companies sourced", "Two-sided quality gate", "Double email verification"],
  },
  {
    slug: "rufescent",
    name: "The Rufescent film",
    gloss:
      "A scroll-driven site for a Dubai members club, built on the same craft this site runs on.",
    url: "https://rufescent-site.vercel.app",
    urlLabel: "rufescent-site.vercel.app",
    poster: "/work/rufescent.jpg",
    video: "/work/rufescent.mp4",
    beats: ["GSAP scrub engine", "Motion on real frames", "Shipped for a client"],
  },
  {
    slug: "pead-system",
    name: "Earnings-drift trading system",
    gloss:
      "An automated system that trades the drift after earnings announcements, run from an 8-view dashboard.",
    url: "https://pead-dashboard.vercel.app",
    urlLabel: "pead-dashboard.vercel.app",
    poster: "/work/pead.jpg",
    beats: ["Event-driven signals", "8-view dashboard", "Live updates"],
  },
];

function Window({ win, i }: { win: Win; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return whenVisible(() => {
      const { gsap } = ensureGsap();
      const ctx = gsap.context(() => {
        // Subtle parallax on the media; entrance is handled by the robust CSS
        // .reveal system so a stalled rAF never hides a window.
        gsap.to(ref.current!.querySelector(".win-shot"), {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }, ref);
      return () => ctx.revert();
    });
  }, []);

  // Hover to play the scroll-through clip; reset to the poster on leave.
  const play = () => {
    const v = videoRef.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <div className={`work-item ${i % 2 ? "work-item-alt" : ""}`} ref={ref}>
      <div className="work-copy">
        <p className="eyebrow">Flagship {i + 1}</p>
        <h3 className="work-name">{win.name}</h3>
        <p className="work-gloss">{win.gloss}</p>
        <div className="work-beats">
          {win.beats.map((b) => (
            <span className="work-beat" key={b}>
              <span className="node" aria-hidden="true" /> {b}
            </span>
          ))}
        </div>
        <div className="work-actions">
          <a className="btn btn-primary" href={win.url} target="_blank" rel="noreferrer">
            Open live
          </a>
          <a className="btn" href={`#item-${win.slug}`}>
            The receipt
          </a>
        </div>
      </div>

      <div
        className={`win-frame glass reveal ${win.video ? "win-has-video" : ""}`}
        onMouseEnter={play}
        onMouseLeave={stop}
        onFocus={play}
        onBlur={stop}
      >
        <div className="win-bar" aria-hidden="true">
          <span className="win-dots">
            <i /> <i /> <i />
          </span>
          <span className="win-url">{win.urlLabel}</span>
        </div>
        <div className="win-screen">
          <div className="win-placeholder" aria-hidden="true">
            <span>{win.name}</span>
          </div>
          {win.video ? (
            <>
              {/* muted scroll-through clip; poster (the screenshot) shows at rest */}
              <video
                ref={videoRef}
                className="win-shot loaded"
                poster={win.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${win.name} preview`}
              >
                <source src={win.video} type="video/mp4" />
              </video>
              <span className="win-playcue" aria-hidden="true">
                ▶ hover to play
              </span>
            </>
          ) : (
            <img
              className="win-shot"
              src={win.poster}
              alt={`${win.name} screenshot`}
              loading="lazy"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  return (
    <section className="scene work" id="flagships" aria-label="The work">
      <div className="wrap">
        <p className="eyebrow work-lead reveal">The work</p>
        <h2 className="work-h reveal">Four I would show you first.</h2>
      </div>
      <div className="wrap work-list">
        {WINS.map((w, i) => (
          <Window key={w.slug} win={w} i={i} />
        ))}
      </div>
      <p className="wrap work-more reveal">plus the full record above ↑</p>
    </section>
  );
}
