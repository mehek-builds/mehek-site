import type { Metadata } from "next";
import AboutBody from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "Mehek Mandal: the person",
  description: "Why I turned down the safe version of my twenties.",
  openGraph: {
    title: "Mehek Mandal: the person",
    description: "Why I turned down the safe version of my twenties.",
    url: "/about",
    siteName: "Mehek Mandal",
    images: ["/og.png"],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehek Mandal: the person",
    description: "Why I turned down the safe version of my twenties.",
    creator: "@MehekBuilds",
    images: ["/og.png"],
  },
};

export default function AboutPage() {
  return <AboutBody />;
}
