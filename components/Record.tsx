"use client";
// Scene 2 — THE RECORD (the centerpiece). A pinned graphic builds the shipping
// timeline Aug 2024 → now while beat text scrolls past. On unpin it settles
// into a persistent interactive index (the Receipts section below). Every node
// is a real item; clicking one deep-links to its receipt (#item-slug).
import { useEffect, useRef } from "react";
import { ensureGsap } from "../lib/gsap";
import { whenVisible } from "../lib/visible";
import { NODES, TEXTURE, RECORD_BEATS, pillarLum } from "../lib/record";
import { COUNTS } from "../content/counts";

const ROW_LABEL = ["Ventures", "Inventions", "Leading", "Content"];

export default function Record() {
  const root = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const nodeEls = Array.from(
      root.current!.querySelectorAll<HTMLElement>(".rec-node")
    );
    const beatEls = Array.from(
      root.current!.querySelectorAll<HTMLElement>(".rec-beat")
    );
    const total = NODES.length;

    const apply = (p: number) => {
      let lit = 0;
      for (const el of nodeEls) {
        const at = parseFloat(el.dataset.at || "0");
        if (at <= p) {
          el.classList.add("lit");
          lit++;
        } else {
          el.classList.remove("lit");
        }
      }
      if (countRef.current) countRef.current.textContent = String(lit);
      // active beat = last beat whose threshold has passed
      let active = 0;
      RECORD_BEATS.forEach((b, i) => {
        if (p >= b.at) active = i;
      });
      beatEls.forEach((el, i) => el.classList.toggle("active", i === active));
    };

    // Default the DOM to fully lit so a background (hidden) tab or a stalled
    // rAF never leaves the record dark. The scrub takes over once visible.
    apply(1);

    return whenVisible(() => {
      const ctx = gsap.context(() => {
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=360%",
          pin: ".rec-stage",
          scrub: 0.5,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });
        apply(0);
        return () => st.kill();
      }, root);
      return () => ctx.revert();
    });
  }, []);

  const openNode = (slug: string) => {
    if (typeof window !== "undefined") window.location.hash = `item-${slug}`;
  };

  return (
    <section className="scene record" id="record" ref={root}>
      <div className="rec-stage">
        <div className="wrap rec-head">
          <p className="eyebrow">The record</p>
          <p className="rec-count-line">
            <span className="num" ref={countRef}>
              {COUNTS.total}
            </span>{" "}
            real things.
          </p>
        </div>

        <div className="rec-plot-wrap">
          <div className="rec-rows" aria-hidden="true">
            {ROW_LABEL.map((l) => (
              <span key={l} className="rec-row-label">
                {l}
              </span>
            ))}
          </div>
          <div className="rec-plot">
            {/* real activity texture (non-interactive) */}
            {TEXTURE.map((t, i) => (
              <span
                key={"t" + i}
                className="rec-tex"
                aria-hidden="true"
                style={{
                  left: `${t.xFrac * 100}%`,
                  top: `${(t.row + 0.5) * 25 + t.yJit * 7}%`,
                  opacity: t.intensity,
                }}
              />
            ))}
            {/* real item nodes (interactive) */}
            {NODES.map((n) => (
              <button
                key={n.item.slug}
                className="rec-node"
                data-at={n.litAt.toFixed(3)}
                data-slug={n.item.slug}
                onClick={() => openNode(n.item.slug)}
                style={{
                  left: `${n.xFrac * 100}%`,
                  top: `${(n.row + 0.5) * 25 + n.yJit * 8}%`,
                  ["--nc" as string]: `var(--lum-${pillarLum(n.item.pillar)})`,
                }}
                aria-label={`${n.item.title}: ${n.item.oneLiner}`}
              >
                <span className="rec-pop" aria-hidden="true">
                  <b>{n.item.title}</b>
                  <span>{n.item.oneLiner}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="rec-axis" aria-hidden="true">
            <span>Aug 2024</span>
            <span>now</span>
          </div>
        </div>

        <div className="rec-beats" aria-live="off">
          {RECORD_BEATS.map((b, i) => (
            <p className={`rec-beat ${i === 0 ? "active" : ""}`} key={i}>
              {b.text}
            </p>
          ))}
        </div>
      </div>
      <p className="wrap rec-hint">Every node is real. Click any of them.</p>
    </section>
  );
}
