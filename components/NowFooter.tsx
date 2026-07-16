"use client";
// Scene 6 — NOW + colophon / footer. The live widget bakes at build from
// now.json (anti-rot: degrades to a still-true "Latest ship" line past 21 days).
// Two CTAs, colophon, and the terminal easter egg.
import Link from "next/link";
import Terminal from "./Terminal";
import { getNow, BUILD_DATE } from "../content/now";

export default function NowFooter() {
  const now = getNow(BUILD_DATE);
  return (
    <footer className="scene nowfoot" id="now" aria-label="Now">
      <div className="wrap">
        {/* REDESIGNED 2026-07-16 (Mehek). Both halves of the Jacqueline import
            are gone: the boxed status object (the card) and the rotating status
            line. What is left is the site's own language, a hairline row set
            keyed by mono labels, the same shape as a receipts ledger row. The
            rotator was also redundant: its strongest line just repeated the
            last-ship sentence sitting directly above it. Ember stays on the live
            node and the two checkable links (law 1: live signals and verified
            facts), never on the labels or the rules. */}
        <dl className="now-widget reveal">
          {!now.stale && (
            <div className="now-row">
              <dt className="now-key">
                <span className="node-live" aria-hidden="true" /> Now
              </dt>
              <dd className="now-val">
                Building <b>{now.building!.name}</b>, {now.building!.gloss}.
              </dd>
            </div>
          )}
          <div className="now-row">
            {/* stale (now.json older than 21 days at build): the "currently"
                claim drops and this row carries a statement that stays true */}
            <dt className="now-key">{now.stale ? "Latest ship" : "Last ship"}</dt>
            <dd className="now-val">
              {now.lastShip.url ? (
                <a className="now-link" href={now.lastShip.url} target="_blank" rel="noreferrer">
                  {now.lastShip.name}
                </a>
              ) : (
                <b>{now.lastShip.name}</b>
              )}
              , {now.lastShip.gloss}.
              <span className="now-date">{now.lastShip.date}</span>
            </dd>
          </div>
          {now.post && (
            <div className="now-row">
              <dt className="now-key">This week</dt>
              <dd className="now-val">
                <a className="now-post" href={now.post.url} target="_blank" rel="noreferrer">
                  {now.post.label} ↗
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="now-cta reveal">
          <h2 className="now-h">Let&apos;s talk.</h2>
          {/* was .hero-cta: a dead class name left over from a hero CTA that no
              longer exists, and it carried NO layout, so these two sat as bare
              inline links separated by a text space. That was the crowding. */}
          <div className="now-actions">
            <a className="btn btn-primary" href="mailto:mehekman@usc.edu">
              Get in touch
            </a>
            {/* Was "Follow along" -> Instagram. Mehek, 2026-07-16: no
                @mehek.builds on the site; the CTA is email instead. */}
            <a className="btn" href="mailto:mehekbuilds@gmail.com">
              Reach out
            </a>
          </div>
        </div>

        <div className="colophon">
          {/* The "/" terminal stays mounted but is no longer advertised
              (Mehek, 2026-07-16): a true easter egg now — explorers only. */}
          <p>One of the weekly ships, built on the craft I ship for clients.</p>
          <div className="colophon-links">
            <Link href="/about">About</Link>
            <a href="https://github.com/mehek-builds" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://x.com/MehekBuilds" target="_blank" rel="noreferrer">
              X
            </a>
            <a href="https://www.linkedin.com/in/mehekmandal" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="mailto:mehekman@usc.edu">Email</a>
          </div>
          <p className="colophon-fine">Mehek Mandal · {BUILD_DATE.slice(0, 4)}</p>
        </div>
      </div>
      <Terminal />
    </footer>
  );
}
