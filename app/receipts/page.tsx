import type { Metadata } from "next";
import Receipts from "@/components/Receipts";

export const metadata: Metadata = {
  title: "Mehek Mandal: the receipts",
  description: "Everything the highlight reel doesn't carry, with the proof.",
  openGraph: {
    title: "Mehek Mandal: the receipts",
    description: "Everything the highlight reel doesn't carry, with the proof.",
    url: "/receipts",
    siteName: "Mehek Mandal",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehek Mandal: the receipts",
    description: "Everything the highlight reel doesn't carry, with the proof.",
    creator: "@MehekBuilds",
    images: ["/og.png"],
  },
};

export default function ReceiptsPage() {
  return <Receipts />;
}
