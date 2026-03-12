import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CTASection } from '@/components/landing/cta-section';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { Footer } from '@/components/navigation/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <CTASection />
      <Footer variant="dark" />
    </div>
  );
}
