"use client";
// Scene 6 — NOW + colophon / footer. The live widget bakes at build from
// now.json (anti-rot: degrades to a still-true "Latest ship" line past 21 days).
// Two CTAs, colophon, and the terminal easter egg.
import Terminal from "./Terminal";
import { getNow, BUILD_DATE } from "../content/now";

export default function NowFooter() {
  const now = getNow(BUILD_DATE);
  return (
    <footer className="scene nowfoot" id="now" aria-label="Now">
      <div className="wrap">
        <div className="now-widget glass reveal">
          <span className="now-tag">
            <span className="node-live" aria-hidden="true" /> now
          </span>
          {now.stale ? (
            <p className="now-text">
              Latest ship: <b>{now.lastShip.name}</b>, {now.lastShip.date}.
            </p>
          ) : (
            <p className="now-text">
              Currently building <b>{now.building!.name}</b>, {now.building!.gloss}.
              Last ship:{" "}
              {now.lastShip.url ? (
                <a className="now-link" href={now.lastShip.url} target="_blank" rel="noreferrer">
                  {now.lastShip.name}
                </a>
              ) : (
                <b>{now.lastShip.name}</b>
              )}
              , {now.lastShip.date}.
            </p>
          )}
          {now.post && (
            <a className="now-post" href={now.post.url} target="_blank" rel="noreferrer">
              {now.post.label} ↗
            </a>
          )}
        </div>

        <div className="now-cta reveal">
          <h2 className="now-h">Let&apos;s talk.</h2>
          <div className="hero-cta">
            <a className="btn btn-primary" href="mailto:mehekman@usc.edu">
              Get in touch
            </a>
            <a className="btn" href="https://www.instagram.com/mehek.builds" target="_blank" rel="noreferrer">
              Follow along
            </a>
          </div>
        </div>

        <div className="colophon">
          <p>
            One of the weekly ships, built on the craft I ship for clients. Press{" "}
            <kbd>/</kbd> for the terminal.
          </p>
          <div className="colophon-links">
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
          <p className="colophon-fine">Mehek Mandal · Dubai / LA · {BUILD_DATE.slice(0, 4)}</p>
        </div>
      </div>
      <Terminal />
    </footer>
  );
}
