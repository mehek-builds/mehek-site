import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import "./scenes.css";

// Expressive editorial serif (the creative voice). Variable, with the optical-
// size axis so big headline cuts get the dramatic display shapes automatically.
const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display-loaded",
  display: "swap",
});

const SITE = "https://mehek-site.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Mehek Mandal — building products",
  description:
    "Young founder who invents, ships, and leads at an unusual rate. A live record of the work, with receipts.",
  openGraph: {
    title: "Mehek Mandal — building products",
    description:
      "Young founder who invents, ships, and leads at an unusual rate. A live record of the work, with receipts.",
    url: SITE,
    siteName: "Mehek Mandal",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehek Mandal — building products",
    description:
      "Young founder who invents, ships, and leads at an unusual rate. A live record, with receipts.",
    creator: "@MehekBuilds",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        {/* Flag JS on immediately so the reduced-motion static twin never flashes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js')}}catch(e){}`,
          }}
        />
        <style>{`:root{--font-display:var(--font-display-loaded),"Fraunces",Georgia,"Times New Roman",serif}`}</style>
      </head>
      <body>
        {children}
        <div className="grade" aria-hidden="true" />
      </body>
    </html>
  );
}
