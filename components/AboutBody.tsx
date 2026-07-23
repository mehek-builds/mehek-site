"use client";
// /about: THE PERSON, as its own surface (Mehek ruling 2026-07-16, option C:
// the full move). Was Scene 5 of the film; the film is now six scenes and the
// trust beat lives here instead.
//
// Copy direction (Mehek, 2026-07-16): paragraph format inside labelled blocks,
// hobbies included and sectioned so she reads as a person outside the work,
// anchored on her own line ("At heart, I'm a builder") and deliberately
// vulnerable. Structure follows Yeji Seo's /about (labelled blocks, short
// concrete prose) WITHOUT her register: her voice is charming-student and the
// §3 founder-CEO frame is locked, so no "welcome to my world!", no exclamation
// marks, no philosophies list.
//
// EVERY fact here is Mehek-backable per the ledger rule: the marathon block is
// her own vault race calendar (absolute beginner Jun 2026, Dubai debut Jan 31
// 2027, pre-5:30am Dubai summer training, finish-not-time on debut); the
// builder line and roller skating are her words from the 2026-07-16 direction.
// Nothing here is invented characterisation.
//
// NOTE: this copy is a DRAFT for Mehek to edit. Ships to production only after
// she approves it (master plan §11, Phase G gate).
import { useEffect, useRef } from "react";
import Link from "next/link";
import Bookshelf from "./Bookshelf";
import OriginGlobe from "./OriginGlobe";
import SiteTabs from "./SiteTabs";

export default function AboutBody() {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  // The one memorable pointer moment, carried over from the scene: a restrained
  // cursor-reactive tilt. Static on touch and under reduced-motion.
  //
  // Yeji's port (Mehek, 2026-07-16): the print rests at rotate(-2.5deg) in CSS.
  // These inline transforms omit that rotation on purpose, so taking the cursor
  // to the photo STRAIGHTENS it and lifts it (scale 1.02, her value), and
  // mouseleave clears the inline style and lets it fall back off-square.
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
      target.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) scale(1.02)`;
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
    <main className="about">
      {/* Same header as the film: corner globe left, route tabs right. The globe
          points home here, where its usual "#top" anchor would be a no-op. */}
      <OriginGlobe stamp markHref="/" />
      <SiteTabs />
      <div className="wrap">
        <header className="about-head">
          <p className="eyebrow">The person</p>
          {/* Light on purpose (Mehek, 2026-07-16): the film carries the
              founder-CEO argument, so this surface is allowed to be warm and to
              earn the hobby blocks below. Her "at heart, I'm a builder" line
              moves into the lede rather than being lost. */}
          <h1 className="titlecard about-title">
            Hi. I promise I do other things.
          </h1>
          <p className="about-lede">
            At heart, I&apos;m a builder. I like meeting people all over the
            world, hearing what gets in their way, and building the simplest
            thing that fixes it. That is the whole job.
          </p>
          <a
            className="about-education"
            href="https://www.usc.edu/"
            target="_blank"
            rel="noreferrer"
            aria-label="Computer science at the University of Southern California"
          >
            <span className="about-education-role">
              Computer
              <br />
              {" "}science
            </span>
            {/* USC's official shield, using the standalone mark rather than
                inventing a badge around the university initials. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="about-education-mark"
              src="/usc-shield.png"
              alt=""
              width="24"
              height="24"
            />
            <span className="sr-only">USC</span>
            <span className="about-education-school">
              University of Southern California
            </span>
          </a>
        </header>

        <div className="about-grid">
          <div className="about-photo" ref={wrap}>
            <div className="about-photo-inner" ref={img}>
              {/* Black-and-white photocopy on pure white (Mehek, 2026-07-16).
                  REAL ASSET, GRADED, nothing generated: her own headshot with
                  the hallway lifted out on-device via Apple's Vision framework
                  (the file never went to a third-party service), then a xerox
                  tone curve. Original headshot.jpg is kept untouched. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/headshot-photocopy.jpg" alt="Mehek Mandal" />
            </div>
            {/* The Dean's List badge is GONE (Mehek, 2026-07-16): "this is not
                about school, this is about me as a person". It was also the last
                credential on the site, which §3 bans anyway. */}
          </div>

          <div className="about-copy">
            <section className="about-block">
              <h2 className="about-block-label">What the bet costs</h2>
              {/* Rewritten 2026-07-16: Mehek, "it sounds like you're pitching
                  yourself". It did. Every cost was being redeemed on the spot
                  ("turned down prestige" = brave; "which of these becomes the
                  company" presupposed one would), and the two best lines were
                  set in ink-strong, which is a pitch deck highlighting itself.
                  The plan's own rule for this fact: the JPM no "must carry its
                  cost, not read as a flex" (§4 origin row), and the block is
                  literally labelled What the bet costs, so the body now pays
                  that label. No emphasis, no rescue, ends on the doubt. */}
              <p>
                I chose this over the safe, prestigious version of my twenties.
                So far that has cost me a degree I have not finished, a startup I
                wound down, and a lot of email that nobody answers.
              </p>
              <p>I do not know yet whether it was the right call.</p>
            </section>

            <section className="about-block">
              <h2 className="about-block-label">57 countries</h2>
              <p>
                I travel to meet people. Most of what I have built started as
                someone else&apos;s complaint.
              </p>
            </section>

            {/* Running lost its own block (Mehek, 2026-07-16) but not its
                facts: she asked for the marathons as a hobby, so they ride here
                with the rest. Same vault calendar, compressed to one line. */}
            <section className="about-block">
              <h2 className="about-block-label">Off the clock</h2>
              <p>
                Roller skating. 22 trails across SoCal, and a running list of the
                ones I have not done yet. Six marathons booked in twelve months,
                starting with Dubai in January, which is ambitious for someone
                who could not run at all in June.
              </p>
            </section>

            {/* Yeji's numbered philosophies block, in Mehek's words (2026-07-16
                direction). Her three lines are already plain and already hers,
                so this is a light polish, NOT a rewrite: inflating them would be
                the exact "poetry" she keeps rejecting. Sentence case, not Yeji's
                lowercase, because the site's prose voice is sentence case. */}
            <section className="about-block">
              <h2 className="about-block-label">My three rules</h2>
              <ol className="about-rules">
                <li className="about-rule">
                  <span className="about-rule-n" aria-hidden="true">01</span>
                  <span>Always learn from everyone, everything, every place.</span>
                </li>
                <li className="about-rule">
                  <span className="about-rule-n" aria-hidden="true">02</span>
                  <span>
                    Explore, and talk to everyone. Connections cost less than the
                    plane ticket.
                  </span>
                </li>
                <li className="about-rule">
                  <span className="about-rule-n" aria-hidden="true">03</span>
                  <span>Open heart, open mind.</span>
                </li>
              </ol>
            </section>

            <div className="about-cta">
              <Link className="btn btn-primary" href="/#flagships">
                See the work
              </Link>
              <a className="btn" href="mailto:mehekbuilds@gmail.com">
                Get in touch
              </a>
            </div>
          </div>
        </div>

        <Bookshelf />
      </div>
    </main>
  );
}
