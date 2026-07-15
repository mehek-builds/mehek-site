"use client";
// Scene 5 — THE PERSON. The trust scene. Headshot with a restrained cursor-
// reactive tilt (static on touch/reduced-motion) + an honest note.
// NOTE: the honest-note copy below is a DRAFT for Mehek to edit. Ships to
// production only after she approves it (master plan §11, Phase G gate).
import { useEffect, useRef } from "react";

export default function Person() {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(pointer: coarse)").matches) return;
    const el = wrap.current;
    const target = img.current;
    if (!el || !target) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
    };
    const reset = () => (target.style.transform = "");
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <section className="scene person" id="person" aria-label="The person">
      <div className="wrap person-grid">
        <div className="person-photo" ref={wrap}>
          <div className="person-photo-inner" ref={img}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/headshot.jpg" alt="Mehek Mandal" loading="lazy" />
          </div>
        </div>
        <div className="person-copy">
          <p className="eyebrow reveal">The person</p>
          <div className="person-note reveal">
            <p>
              I turned down the safe, prestigious version of my twenties to{" "}
              <em className="ink-strong">build things nobody asked me to build</em>.
            </p>
            <p>
              Some weeks that looks like traction. Some weeks it looks like a
              wound-down startup and a lot of unanswered email. I am optimizing for{" "}
              <em className="ink-strong">the shortest loop between an idea and a real user</em>,
              and betting that compounding that loop beats any title.
            </p>
            <p>
              What I do not know yet is which of these becomes the company. I am
              okay not knowing, <em className="ink-strong">as long as I keep shipping</em>.
            </p>
          </div>
          <p className="person-texture reveal">
            57 countries. 22 SoCal trails. Training for 6 marathons; Dubai debut
            Jan 2027.
          </p>
          <div className="person-badges reveal">
            <span className="badge">
              <span className="node" aria-hidden="true" /> Dean&apos;s List
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
