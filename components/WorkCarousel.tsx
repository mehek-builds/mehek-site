"use client";
// Scene 2: THE WORK, as six equal grid cards. Every product keeps its fake-live
// window, real screenshot, and looping product footage, while the full set is
// visible at once instead of hidden inside a moving track.
import { useEffect, useRef } from "react";
import Link from "next/link";
import { COUNTS } from "../content/counts";
import MoonTitle from "./MoonTitle";

interface Card {
  slug: string; // receipt anchor
  name: string;
  gloss: string;
  url: string;
  urlLabel: string;
  poster: string;
  video?: string; // real product footage; loops while the card is visible
  phone?: boolean; // native mobile app: renders a phone mockup, not a browser window
}

const CARDS: Card[] = [
  {
    slug: "litos",
    name: "Litos",
    gloss:
      "Autofills job applications: a Chrome extension, resume generation, and a full product dashboard.",
    url: "https://trylitos.com",
    urlLabel: "trylitos.com",
    poster: "/work/litos.jpg",
  },
  {
    slug: "buildsmart",
    name: "BuildSmart",
    gloss: "An AI agency with live clients. Systems that source, verify, and send.",
    url: "https://buildsmartagency.com",
    urlLabel: "buildsmartagency.com",
    poster: "/work/buildsmart.jpg",
    video: "/work/buildsmart.mp4",
  },
  {
    slug: "traeco",
    name: "Traeco",
    gloss:
      "AI cost visibility for engineering teams: analyzes agent traces and shows exactly what to cut, giving you the cost and quality impact.",
    url: "https://traeco.dev",
    urlLabel: "traeco.dev",
    poster: "/work/traeco.jpg",
    video: "/work/traeco.mp4",
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
  },
  {
    slug: "pead-system",
    name: "Earnings-drift trading system",
    gloss:
      "An automated system that trades the drift after earnings announcements, run from an 8-view dashboard.",
    url: "https://pead-dashboard.vercel.app",
    urlLabel: "pead-dashboard.vercel.app",
    poster: "/work/pead.jpg",
  },
  {
    slug: "fitness-tracker",
    name: "Nourish",
    gloss:
      "All-in-one iOS health app: calories that adapt to your workouts, cycle, and bloodwork via Apple Health.",
    url: "https://github.com/mehek-builds/fitness-tracker",
    urlLabel: "Nourish · iOS",
    poster: "/work/nourish.png",
    video: "/work/nourish.mp4",
    phone: true,
  },
];

// The reel IS the shelf (Mehek ruling, 2026-07-16): these six carry card-level
// emphasis here, so Receipts renders only the remainder and never repeats them.
// Exported so the two sections can never drift: add a card here and it leaves
// the receipts in the same commit.
export const CARD_SLUGS: readonly string[] = CARDS.map((c) => c.slug);

function ProductCard({ card }: { card: Card }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // The footage loops while the card is visible, so every project has movement
  // without decoding five clips while the visitor is elsewhere on the page.
  // Reduced motion is the one exception: pause and rest on the poster frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      v.pause();
      v.removeAttribute("autoplay");
      v.currentTime = 0;
      return;
    }
    let isIntersecting = false;
    const syncPlayback = () => {
      if (document.visibilityState === "visible" && isIntersecting) {
        void v.play().catch(() => {});
      } else {
        v.pause();
      }
    };
    const onVisible = () => syncPlayback();
    document.addEventListener("visibilitychange", onVisible);
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => entries.forEach((entry) => {
              isIntersecting = entry.isIntersecting;
              syncPlayback();
            }),
            { threshold: 0.15 }
          )
        : null;
    io?.observe(v);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      io?.disconnect();
    };
  }, []);
  return (
    <a
      className={`car-card reveal ${card.phone ? "car-phone" : ""} ${card.video ? "has-video" : "has-still"}`}
      href={card.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${card.name}, ${card.phone ? "view the code" : "open the live site"}`}
    >
      <div className="project-media">
      {card.phone ? (
        // native mobile app: a phone mockup, not a browser window
        <div className="phone-frame">
          <span className="phone-notch" aria-hidden="true" />
          {card.video ? (
            <video
              ref={videoRef}
              className="phone-shot"
              poster={card.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={card.video} type="video/mp4" />
            </video>
          ) : (
            <img
              className="phone-shot"
              src={card.poster}
              alt={`${card.name} app screenshot`}
              loading="lazy"
            />
          )}
        </div>
      ) : (
        <div className="win-frame glass">
          <div className="win-bar" aria-hidden="true">
            <span className="win-dots">
              <i /> <i /> <i />
            </span>
            {/* the live URL is the one ember element per frame: "this is deployed" */}
            <span className="win-url">
              <span className="win-live" />
              {card.urlLabel}
            </span>
          </div>
          <div className="win-screen">
            <div className="win-placeholder" aria-hidden="true">
              <span>{card.name}</span>
            </div>
            {/* rendered visible from the start: cached posters finish loading
                before hydration, so an onLoad fade-in class can never attach */}
            <img
              className="win-shot loaded"
              src={card.poster}
              alt={`${card.name} screenshot`}
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            {card.video && (
              <video
                ref={videoRef}
                className="win-video"
                poster={card.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
              >
                <source src={card.video} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      )}
      </div>
      <h3 className="car-name">{card.name}</h3>
      <p className="car-gloss">{card.gloss}</p>
    </a>
  );
}

export default function WorkCarousel() {
  return (
    <section className="scene work-carousel" id="flagships" aria-label="Highlight reel">
      {/* One oversized kinetic line, ink on paper: the eyebrow and the count
          line both went (Mehek, 2026-07-16). The count claim is not lost, it
          still lives in the hero and in the hint below. */}
      <div className="wrap">
        <MoonTitle text="Highlight reel" />
      </div>
      <div className="wrap">
        <div className="car-grid">
          {CARDS.map((c) => (
            <ProductCard key={c.slug} card={c} />
          ))}
        </div>
      </div>
      {/* THE DOOR (Mehek ruling, 2026-07-16). The receipts moved to their own
          tab, so this stopped being a scroll cue and became the only on-page
          route to the remainder. It is load-bearing: the rate claim is stated in
          the hero but its evidence now lives one click away, so this line is
          what keeps "shipped roughly one a week" checkable. Count still derives
          from the data, so it can never drift from what /receipts renders. */}
      <p className="wrap car-hint reveal">
        <Link className="car-hint-link" href="/receipts">
          plus {COUNTS.total - CARDS.length} more, with the proof →
        </Link>
      </p>
    </section>
  );
}
