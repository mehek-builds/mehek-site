"use client";
// The evidence layer below the Record. TWO TIERS (Mehek curation directive,
// 2026-07-12): shelf items (the five flagships + the Traeco tombstone) render
// full receipt cards; everything else renders a one-line ledger row under
// "The rest of the record". Grid nodes and counts include both tiers. Pillar
// filter chips (?pillar= URL state) and #item-slug deep links work across
// both. All content is server-rendered (plain fetch returns every receipt).
import { useEffect, useMemo, useState } from "react";
import { ITEMS, PILLARS, type Item, type Pillar } from "../content/items";

const STATE_NOTE: Record<Item["status"], string> = {
  live: "Live",
  shipped: "Shipped",
  "client-engagement": "Client engagement",
  "wound-down": "Wound down",
  role: "Led",
};

function Card({ item }: { item: Item }) {
  const isTomb = item.status === "wound-down";
  return (
    <article
      id={`item-${item.slug}`}
      className={`receipt glass ${isTomb ? "receipt-tomb" : ""}`}
      data-pillar={item.pillar}
    >
      <div className="receipt-top">
        <span className={`receipt-state state-${item.status}`}>
          {item.status === "live" && <span className="node-live" aria-hidden="true" />}
          {STATE_NOTE[item.status]}
        </span>
        <span className="receipt-date">{item.date.slice(0, 7)}</span>
      </div>

      <h3 className="receipt-title">{item.title}</h3>
      <p className="receipt-gloss">{item.oneLiner}</p>
      <p className="receipt-desc">{item.description}</p>

      {isTomb && (
        <p className="receipt-tombline">
          Wound down 2026. First startup; the lessons fund everything since.
        </p>
      )}

      {item.metrics && item.metrics.length > 0 && (
        <div className="receipt-metrics">
          {item.metrics.map((m) => (
            <span className="metric" key={m.label}>
              <span className="num">{m.value}</span>
              <span className="metric-label">{m.label}</span>
            </span>
          ))}
        </div>
      )}

      {item.makingOf && (
        <div className="receipt-making">
          <p className="receipt-making-h">How it was built</p>
          <ul>
            {item.makingOf.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="receipt-foot">
        {item.tech && (
          <div className="receipt-tech">
            {item.tech.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
        {item.links && item.links.length > 0 && (
          <div className="receipt-links">
            {item.links.map((l) => (
              <a
                key={l.url}
                className="receipt-link"
                href={l.url}
                target="_blank"
                rel="noreferrer"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
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

  const shown = useMemo(
    () =>
      [...ITEMS]
        .filter((i) => active === "all" || i.pillar === active)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [active]
  );
  const shelf = shown.filter((i) => i.tier === "shelf");
  const ledger = shown.filter((i) => i.tier !== "shelf");

  return (
    <section className="scene receipts" id="work" aria-label="The receipts">
      <div className="wrap">
        <div className="receipts-head">
          <p className="eyebrow">The receipts</p>
          <p className="receipts-sub">
            Every node above, with the proof.
          </p>
          <div className="chips" role="tablist" aria-label="Filter by pillar">
            <button
              className={`chip ${active === "all" ? "chip-on" : ""}`}
              onClick={() => setPillar("all")}
              role="tab"
              aria-selected={active === "all"}
            >
              All
            </button>
            {PILLARS.map((d) => (
              <button
                key={d.key}
                className={`chip ${active === d.key ? "chip-on" : ""}`}
                onClick={() => setPillar(d.key)}
                role="tab"
                aria-selected={active === d.key}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {shelf.length > 0 && (
          <div className="receipt-grid">
            {shelf.map((item) => (
              <Card key={item.slug} item={item} />
            ))}
          </div>
        )}

        {ledger.length > 0 && (
          <div className="ledger">
            <p className="ledger-head">The rest of the record</p>
            {ledger.map((item) => (
              <LedgerRow key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
