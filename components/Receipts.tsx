"use client";
// The evidence layer below the reel. PROOF-FIRST (Mehek ruling, 2026-07-16,
// which AMENDS the 2026-07-12 curation row: the reel above is now the shelf, so
// this section is the REMAINDER and never repeats a reel card).
//
// Each item leads with its strongest verified fact in ember display type, then
// the name, the gloss, and the link row: DO #2, "one real outcome per artifact",
// built as a layout. An item with no metric can't lead with one, so it stays a
// one-line ledger row under "The rest of the record" (Mehek ruling, same day)
// rather than rendering a card with an empty hero slot.
//
// A "metric" is any verified fact, not just a number: RoleQuick's is the value
// "Chrome Web Store" with a source link. Ember still means exactly one thing.
// Pillar filter chips (?pillar= URL state) and #item-slug deep links work across
// both groups. All content is server-rendered (plain fetch returns every receipt).
import { useEffect, useMemo, useState } from "react";
import { ITEMS, PILLARS, type Item, type Pillar } from "../content/items";
import { CARD_SLUGS } from "./WorkCarousel";
import OriginGlobe from "./OriginGlobe";
import SiteTabs from "./SiteTabs";

const STATE_NOTE: Record<Item["status"], string> = {
  live: "Live",
  shipped: "Shipped",
  "client-engagement": "Client engagement",
  "wound-down": "Wound down",
  role: "Led",
};

function ProofCard({ item }: { item: Item }) {
  // The lead fact is the card's hero. A second metric rides alongside it (only
  // LetterStory has one today: 651 sourced / 370 passed); anything beyond two
  // would fight the "one real outcome per artifact" rule, so it is dropped.
  const lead = (item.metrics ?? []).slice(0, 2);
  return (
    <article id={`item-${item.slug}`} className="receipt glass proof" data-pillar={item.pillar}>
      <div className="proof-lead">
        {lead.map((m) => {
          const body = (
            <>
              <span className="proof-stat">{m.value}</span>
              <span className="proof-label">
                {m.label}
                {m.source && " · verify ↗"}
              </span>
            </>
          );
          // claims-as-receipts: a sourced fact is a checkable ember link
          return m.source ? (
            <a
              className="proof-fact proof-sourced"
              key={m.label}
              href={m.source}
              target="_blank"
              rel="noreferrer"
              aria-label={`${m.value} ${m.label}, verify at the source`}
            >
              {body}
            </a>
          ) : (
            <span className="proof-fact" key={m.label}>
              {body}
            </span>
          );
        })}
      </div>

      <hr className="proof-rule" />

      <h3 className="receipt-title">{item.title}</h3>
      <p className="receipt-gloss">{item.oneLiner}</p>

      <div className="proof-foot">
        {item.links && item.links.length > 0 && (
          <div className="receipt-links">
            {item.links.map((l) => (
              <a key={l.url} className="receipt-link" href={l.url} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
        {item.nda && <span className="proof-nda">Under NDA, available upon request</span>}
        {/* State + date stay, quiet, under the fact: reverse-chron order needs a
            visible date to read as an order, and "live" is real information. */}
        <span className="proof-state">
          {item.status === "live" && <span className="node-live" aria-hidden="true" />}
          {STATE_NOTE[item.status]} · {item.date.slice(0, 7)}
        </span>
      </div>
    </article>
  );
}

// One quiet line: date, name, gloss, one proof. The gloss is the oneLiner with
// a leading "Title," stripped so the name never reads twice.
function LedgerRow({ item }: { item: Item }) {
  const stripped = item.oneLiner.startsWith(`${item.title},`)
    ? item.oneLiner.slice(item.title.length + 1).trim()
    : item.oneLiner;
  const proofMetric = (!item.links || item.links.length === 0) && item.metrics?.[0];
  return (
    <article id={`item-${item.slug}`} className="ledger-row" data-pillar={item.pillar}>
      <span className="ledger-date">{item.date.slice(0, 7)}</span>
      <span className="ledger-main">
        <span className="ledger-name">{item.title}</span>{" "}
        <span className="ledger-gloss">{stripped}</span>
      </span>
      <span className="ledger-proof">
        {item.links?.map((l) => (
          <a key={l.url} className="ledger-link" href={l.url} target="_blank" rel="noreferrer">
            {l.label} ↗
          </a>
        ))}
        {proofMetric && (
          <span className="ledger-metric">
            <span className="num">{proofMetric.value}</span> {proofMetric.label.toLowerCase()}
          </span>
        )}
      </span>
    </article>
  );
}

export default function Receipts() {
  const [active, setActive] = useState<Pillar | "all">("all");

  // read ?pillar= on mount, react to hash for deep-link scroll+flash
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("pillar");
    if (p && PILLARS.some((d) => d.key === p)) setActive(p as Pillar);

    const flash = () => {
      const h = window.location.hash;
      if (!h.startsWith("#item-")) return;
      const el = document.getElementById(h.slice(1));
      if (el) {
        setActive("all");
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("flash");
          setTimeout(() => el.classList.remove("flash"), 1600);
        });
      }
    };
    flash();
    window.addEventListener("hashchange", flash);
    return () => window.removeEventListener("hashchange", flash);
  }, []);

  const setPillar = (p: Pillar | "all") => {
    setActive(p);
    const url = new URL(window.location.href);
    if (p === "all") url.searchParams.delete("pillar");
    else url.searchParams.set("pillar", p);
    window.history.replaceState(null, "", url);
  };

  // The reel is the shelf; this page is everything it does not carry. Derived
  // from the same data + CARD_SLUGS, so the reel's "plus N more" door and this
  // page can never disagree about the number.
  const remainder = useMemo(
    () =>
      [...ITEMS]
        .filter((i) => !CARD_SLUGS.includes(i.slug))
        .sort((a, b) => b.date.localeCompare(a.date)),
    []
  );
  const shownAll = remainder.length;
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: remainder.length };
    for (const i of remainder) c[i.pillar] = (c[i.pillar] ?? 0) + 1;
    return c;
  }, [remainder]);
  const shown = useMemo(
    () => remainder.filter((i) => active === "all" || i.pillar === active),
    [remainder, active]
  );
  // A card must lead with a verified fact. No fact, no card: those drop to a
  // one-line row rather than opening on an empty hero slot.
  const proven = shown.filter((i) => (i.metrics?.length ?? 0) > 0);
  const rest = shown.filter((i) => (i.metrics?.length ?? 0) === 0);

  return (
    <main className="receipts-page">
      {/* Same header as every surface: corner globe left, route tabs right. */}
      <OriginGlobe stamp markHref="/" />
      <SiteTabs />
      <div className="wrap">
        <header className="receipts-head">
          <p className="eyebrow">The receipts</p>
          <h1 className="titlecard receipts-title">Everything else.</h1>
          {/* The rate claim's evidence lives here now, so the count is stated
              rather than left implicit: this page IS the answer to "one a week?" */}
          <p className="receipts-sub">
            {shownAll} projects the highlight reel doesn&rsquo;t carry, each with
            whatever proof exists for it.
          </p>
        </header>

        <div className="receipts-body">
          {/* Yeji's left-rail FILTER (Mehek, 2026-07-16): the chips became a
              vertical rail so the list reads as an index, not a toolbar. Same
              ?pillar= URL state and the same pillars as before. */}
          <nav className="rfilter" aria-label="Filter by pillar">
            <p className="rfilter-head">Filter</p>
            <button
              className={`rfilter-item ${active === "all" ? "rfilter-on" : ""}`}
              onClick={() => setPillar("all")}
              aria-pressed={active === "all"}
            >
              Everything <span className="rfilter-n">{counts.all}</span>
            </button>
            {PILLARS.map((d) => (
              <button
                key={d.key}
                className={`rfilter-item ${active === d.key ? "rfilter-on" : ""}`}
                onClick={() => setPillar(d.key)}
                aria-pressed={active === d.key}
              >
                {d.label} <span className="rfilter-n">{counts[d.key] ?? 0}</span>
              </button>
            ))}
          </nav>

          <div className="receipts-main">
            {proven.length > 0 && (
              <div className="receipt-grid">
                {proven.map((item) => (
                  <ProofCard key={item.slug} item={item} />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="ledger">
                <p className="ledger-head">The rest of the record</p>
                {rest.map((item) => (
                  <LedgerRow key={item.slug} item={item} />
                ))}
              </div>
            )}

            {proven.length === 0 && rest.length === 0 && (
              <p className="receipts-empty">Nothing under this filter yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
