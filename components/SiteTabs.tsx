"use client";
// The site's route tabs: the two surfaces (the film at /, the person at /about),
// parked top-right and centred on the corner globe's sightline so the two read
// as one header. Mehek directive, 2026-07-16.
//
// Design-law compliance, since this is brand-new chrome:
//  - NO node (law 2: the node is the site's only icon language and means a real
//    shipped thing / a section of the film. These are routes, so they stay
//    nodeless: same call already made for the sticky nav's About link).
//  - NO ember (law 1: the accent is reserved for verified facts and live
//    signals, "never on chrome"). The current tab is INK. This is the one place
//    the tabs deviate from the sticky nav, which lights its active label amber.
//  - Mono uppercase micro-label: the site's existing system-label voice, matched
//    to .scene-caption-text exactly (the three-voice type principle).
import Link from "next/link";
import { usePathname } from "next/navigation";

// The site's three surfaces (Mehek ruling, 2026-07-16). "Receipts", not
// "Playground": the remainder carries verified facts, and Yeji's word would read
// as toys to an investor, which fights "proof carries the color".
const TABS = [
  { href: "/", label: "Work" },
  { href: "/receipts", label: "Receipts" },
  { href: "/about", label: "About" },
];

export default function SiteTabs() {
  const path = usePathname();
  return (
    <nav className="site-tabs" aria-label="Sections">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`site-tab ${active ? "site-tab-on" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
