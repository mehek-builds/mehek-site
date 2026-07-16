import Hero from "@/components/Hero";
import IntroZoomOut from "@/components/IntroZoomOut";
import WorkCarousel from "@/components/WorkCarousel";
import OriginGlobe from "@/components/OriginGlobe";
import NowFooter from "@/components/NowFooter";
import StickyNav from "@/components/StickyNav";
import SiteTabs from "@/components/SiteTabs";
import SceneCaption from "@/components/SceneCaption";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <main>
      <Reveal />
      <StickyNav />
      <SceneCaption />
      {/* IntroZoomOut must mount before the stamp: its layout effect flags the
          running intro, and the stamp waits for the baton instead of starting */}
      <IntroZoomOut />
      <OriginGlobe stamp />
      <SiteTabs />
      <Hero />
      <WorkCarousel />
      <NowFooter />
    </main>
  );
}
