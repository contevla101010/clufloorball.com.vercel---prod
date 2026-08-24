import { useContent } from "@/context/ContentContext";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { ChiSiamo } from "@/components/site/ChiSiamo";
import { Numeri } from "@/components/site/Numeri";
import { Squadre } from "@/components/site/Squadre";
import { Gioca } from "@/components/site/Gioca";
import { EmotionalMoment } from "@/components/site/EmotionalMoment";
import { Sponsor } from "@/components/site/Sponsor";
import { PartnerWall } from "@/components/site/PartnerWall";
import { SocialWall } from "@/components/site/SocialWall";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { BallTrail } from "@/components/site/BallTrail";
import { Marquee } from "@/components/motion/Marquee";

const MARQUEE = ["SPEED", "ENERGY", "COMMUNITY", "THIS IS FLOORBALL", "SMALL CLUB. BIG ENERGY."];

export default function Home() {
  const { content, error } = useContent();

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink px-6 text-center text-brand-off">
        <p className="font-manrope">Impossibile caricare i contenuti. Riprova più tardi.</p>
      </div>
    );

  if (!content)
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ink">
        <span className="animate-pulse font-anton text-2xl uppercase tracking-[0.3em] text-brand-off">
          Centro Lombardia
        </span>
      </div>
    );

  const { settings, teams, courses, sponsors } = content;

  return (
    <div className="relative bg-brand-ink">
      <BallTrail />
      <Header settings={settings} />
      <main>
        <Hero settings={settings} />
        <Manifesto settings={settings} />

        <div className="border-y border-white/10 bg-brand-ink py-6 md:py-8">
          <Marquee
            items={MARQUEE}
            className="font-anton text-4xl uppercase text-stroke md:text-6xl"
            itemClassName="whitespace-nowrap"
          />
        </div>

        <ChiSiamo settings={settings} />
        <Numeri settings={settings} />
        <Squadre teams={teams} />
        <Gioca settings={settings} courses={courses} />
        <EmotionalMoment settings={settings} />
        <Sponsor settings={settings} />
        <PartnerWall sponsors={sponsors} />
        <SocialWall settings={settings} />
        <FinalCTA />
      </main>
      <Footer settings={settings} />
      <WhatsAppButton settings={settings} />
    </div>
  );
}
