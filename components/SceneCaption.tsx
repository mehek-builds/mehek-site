"use client";
// PROTOTYPE 2026-07-15 (Teri Shim's contextual scroll label). A fixed quiet mono
// caption, bottom-left, that rewrites itself as each scene enters: motion that
// carries information (where you are in the narrative) AND doubles as scroll
// orientation, so it passes the "motion must carry information" law. Appears
// after the hero (like the sticky nav), hides < 820px alongside the globe/nav,
// opacity crossfade only, reduced-motion just swaps text with no fade.
import { useEffect, useRef, useState } from "react";

// Ordered to match the page; keyed by section id. The hero (id="top") sets the
// opening line, then each scene reframes it.
const CAPTIONS: { id: string; text: string }[] = [
  { id: "top", text: "Mehek Mandal · building products" },
  { id: "flagships", text: "The work · shipped, roughly one a week" },
  // the receipts caption went with the receipts (Mehek, 2026-07-16): they are a
  // route now, so the film no longer has a #work section to narrate
  { id: "leading", text: "Leading · people, budgets, and programs" },
  { id: "route", text: "The route · Delhi · Dubai · Los Angeles" },
  { id: "now", text: "Now · currently building" },
];

export default function SceneCaption() {
  const [text, setText] = useState(CAPTIONS[0].text);
  const [shown, setShown] = useState(false); // gated in after the hero
  const [visible, setVisible] = useState(true); // crossfade toggle
  const currentId = useRef("top");

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let swapT = 0;
    const setCaption = (id: string) => {
      const c = CAPTIONS.find((x) => x.id === id);
      if (!c || currentId.current === id) return;
      currentId.current = id;
      if (reduced) {
        setText(c.text);
        return;
      }
      setVisible(false); // fade out
      window.clearTimeout(swapT);
      swapT = window.setTimeout(() => {
        setText(c.text);
        setVisible(true); // fade in
      }, 220);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCaption(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    CAPTIONS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(swapT);
      io.disconnect();
    };
  }, []);

  return (
    <div className={`scene-caption ${shown ? "is-on" : ""}`} aria-hidden="true">
      <span className={`scene-caption-text ${visible ? "is-in" : "is-out"}`}>
        {text}
      </span>
    </div>
  );
}
