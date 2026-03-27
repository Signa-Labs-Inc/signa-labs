import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PreviewSection } from '@/components/landing/preview-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/navigation/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <CTASection />
      <Footer variant="dark" />
    </div>
  );
}
