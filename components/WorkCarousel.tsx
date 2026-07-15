"use client";
// Scene 2 — THE WORK, as a continuously rotating carousel. Replaces the pinned
// timeline record (Mehek, 2026-07-13): every product is a card — a fake-live
// window (device chrome + real screenshot) with the name and a short gloss
// riding underneath it. The track drifts left forever (seamless loop via a
// duplicated half), pauses on hover so the links are clickable, and falls back
// to a plain scrollable row under prefers-reduced-motion.
import { useEffect, useRef } from "react";
import { COUNTS } from "../content/counts";

interface Card {
  slug: string; // receipt anchor
  name: string;
  gloss: string;
  url: string;
  urlLabel: string;
  poster: string;
  video?: string; // real product footage; hover-plays over the poster
}

const CARDS: Card[] = [
  {
    slug: "rolequick",
    name: "RoleQuick",
    gloss:
      "Autofills job applications: a Chrome extension, resume generation, and a full product dashboard.",
    url: "https://role-quick-website.vercel.app",
    urlLabel: "role-quick-website.vercel.app",
    poster: "/work/rolequick.jpg",
    video: "/work/rolequick.mp4",
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
    slug: "traeco",
    name: "Traeco",
    gloss:
      "AI cost visibility for engineering teams: analyzes agent traces and shows exactly what to cut, giving you the cost and quality impact.",
    url: "https://traeco.dev",
    urlLabel: "traeco.dev",
    poster: "/work/traeco.jpg",
    video: "/work/traeco.mp4",
  },
];

function ProductCard({ card, ariaHidden }: { card: Card; ariaHidden?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // The footage loops continuously (muted, autoplay), so every window is alive.
  // Reduced-motion is the one exception: pause and rest on the poster frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.removeAttribute("autoplay");
      v.currentTime = 0;
    } else {
      void v.play().catch(() => {});
    }
  }, []);
  return (
    <a
      className="car-card"
      href={card.url}
      target="_blank"
      rel="noreferrer"
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
      aria-label={ariaHidden ? undefined : `${card.name}, open the live site`}
    >
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
            alt={ariaHidden ? "" : `${card.name} screenshot`}
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          {card.video && (
            <video
              ref={videoRef}
              className="win-video"
              poster={card.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={card.video} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
      <h3 className="car-name">{card.name}</h3>
      <p className="car-gloss">{card.gloss}</p>
    </a>
  );
}

// One full half-track (the seamless loop length) drifts past in this many
// seconds; the px/s speed derives from the measured half width so the pace
// matches the old CSS marquee at any card size.
const LOOP_SECONDS = 55;

export default function WorkCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = trackRef.current!;
    const GAP = 40; // matches .car-track gap in scenes.css

    let x = 0; // current translate, wrapped into (-half, 0]
    let half = 0; // loop length: half the track + one gap
    let hovered = false;
    let dragging = false;
    let captured = false;
    let dragPointer = -1;
    let lastPointerX = 0;
    let dragDistance = 0;
    let raf = 0;
    let last = performance.now();

    const measure = () => {
      half = track.scrollWidth / 2 + GAP / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const wrap = () => {
      if (half <= 0) return;
      x = (((x % half) + half) % half) - half; // into [-half, 0)
      track.style.transform = `translateX(${x}px)`;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      // auto-drift only while the cursor is away; a hover hands over control
      if (!hovered && !dragging) {
        x -= (half / LOOP_SECONDS) * dt;
        wrap();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
      dragging = false;
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragPointer = e.pointerId;
      lastPointerX = e.clientX;
      dragDistance = 0;
      captured = false;
      // NB: do NOT capture the pointer here. setPointerCapture retargets the
      // follow-up click event to the capturing element (.car-track), so the
      // card <a> never receives the click and never navigates. Capture is
      // taken lazily in onMove once a real drag starts.
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragPointer) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      dragDistance += Math.abs(dx);
      // only once this is unmistakably a drag do we grab the pointer, so a
      // plain click keeps landing on the link underneath it
      if (!captured && dragDistance > 6) {
        try {
          track.setPointerCapture(dragPointer);
        } catch {}
        captured = true;
      }
      x += dx;
      wrap();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== dragPointer) return;
      dragging = false;
      captured = false;
      // touch has no hover: releasing the finger resumes the drift
      if (e.pointerType !== "mouse") hovered = false;
    };
    // a real drag must not fire the link under the pointer on release
    const onClick = (e: MouseEvent) => {
      if (dragDistance > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      dragDistance = 0;
    };

    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("click", onClick, true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <section className="scene work-carousel" id="flagships" aria-label="The work">
      <div className="wrap">
        <p className="eyebrow reveal">The work</p>
        <p className="car-count-line reveal">
          <span className="num">{COUNTS.shipped}</span> shipped projects so far.
        </p>
      </div>
      <div className="car-viewport">
        <div className="car-track" ref={trackRef}>
          {CARDS.map((c) => (
            <ProductCard key={c.slug} card={c} />
          ))}
          {/* duplicated half: makes the wrap-around seamless */}
          {CARDS.map((c) => (
            <ProductCard key={c.slug + "-dup"} card={c} ariaHidden />
          ))}
        </div>
      </div>
      <p className="wrap car-hint reveal">
        plus {COUNTS.total - CARDS.length} more in the receipts below ↓
      </p>
    </section>
  );
}
