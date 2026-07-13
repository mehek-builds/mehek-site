"use client";
// Scene 4 — LEADING. Three Collison-compressed lines, one count-up each. Only
// VCA and Spark earn org lines; the third is proven through built work. Verb-
// first, no titles rendered. Every org name carries its gloss.
import CountUp from "./CountUp";
import { COUNTS } from "../content/counts";

export default function Leading() {
  return (
    <section className="scene leading" id="leading" aria-label="Leading">
      <div className="wrap">
        <p className="eyebrow reveal">Leading</p>
        <div className="lead-lines">
          <p className="lead-line reveal">
            Built <b>Venture Capital Academy</b>, USC&apos;s first student VC program.{" "}
            <CountUp to={COUNTS.studentsLed} /> <span className="lead-unit">students</span>, an
            8-week curriculum, investors from Lightspeed, NEA, and Altos in the room.
          </p>
          <p className="lead-line reveal">
            Ran the money at <b>Spark SC</b>, USC&apos;s student entrepreneurship org.{" "}
            <CountUp to={14} prefix="$" suffix="K" /> raised, a $27K budget, sponsor
            renewal <span className="num">40% → 71%</span>.
          </p>
          <p className="lead-line reveal">
            Runs <b>BuildSmart</b>, an AI agency.{" "}
            <CountUp to={COUNTS.clientSystems} />{" "}
            <span className="lead-unit">client systems shipped</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
