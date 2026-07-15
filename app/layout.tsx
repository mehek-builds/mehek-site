import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./scenes.css";
import CursorSnitch from "../components/CursorSnitch";
import FaviconGlobe from "../components/FaviconGlobe";

// Light, high-contrast editorial serif (the creative voice). Airy display cuts.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display-loaded",
  display: "swap",
});

// Quiet neutral grotesque — body and every small functional label. Variable
// weight, subset locally so we control spacing and it renders the same on
// every OS (no more system-font drift).
const text = localFont({
  src: [
    {
      path: "./fonts/GeneralSans-Variable.woff2",
      weight: "200 700",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-VariableItalic.woff2",
      weight: "200 700",
      style: "italic",
    },
  ],
  variable: "--font-text-loaded",
  display: "swap",
});

const SITE = "https://mehek-site.vercel.app";

// The static globe favicon: server-rendered so no-JS, crawlers, and
// reduced-motion all get the mark (it is the animated tab globe's static twin).
// FaviconGlobe upgrades THIS same link to the spinning canvas frames when motion
// is allowed; a plain <link> that never re-renders avoids the file-convention
// (app/icon) race that would otherwise put a competing icon last in the head.
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="p" cx="38%" cy="34%" r="76%"><stop offset="0" stop-color="#fffefb"/><stop offset="1" stop-color="#f4f1e9"/></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#p)" stroke="#181410" stroke-opacity="0.42" stroke-width="2"/><g fill="none" stroke="#181410" stroke-opacity="0.30" stroke-width="1.4"><line x1="4" y1="32" x2="60" y2="32"/><line x1="6.7" y1="20" x2="57.3" y2="20"/><line x1="6.7" y1="44" x2="57.3" y2="44"/><ellipse cx="32" cy="32" rx="12.6" ry="28"/><ellipse cx="32" cy="32" rx="23" ry="28"/></g></svg>`;
const FAVICON_HREF = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Mehek Mandal: building products",
  description:
    "A live record of the work, with receipts.",
  openGraph: {
    title: "Mehek Mandal: building products",
    description:
      "A live record of the work, with receipts.",
    url: SITE,
    siteName: "Mehek Mandal",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehek Mandal: building products",
    description:
      "A live record of the work, with receipts.",
    creator: "@MehekBuilds",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/svg+xml" href={FAVICON_HREF} />
        {/* Flag JS on immediately so the reduced-motion static twin never flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js')}}catch(e){}`,
          }}
        />
        <style>{`:root{--font-display:var(--font-display-loaded),"Instrument Serif",Georgia,"Times New Roman",serif;--font-text:var(--font-text-loaded),"General Sans",ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}`}</style>
      </head>
      <body>
        {children}
        <div className="grade" aria-hidden="true" />
        <CursorSnitch />
        <FaviconGlobe />
      </body>
    </html>
  );
}
