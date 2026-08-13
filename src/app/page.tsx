import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
      </main>
    </div>
  );
}
