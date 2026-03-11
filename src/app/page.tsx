import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { CTASection } from '@/components/landing/cta-section';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <footer className="border-t border-white/10 bg-black px-6 py-8">
        <p className="text-center text-sm text-zinc-500">
          &copy; 2024 Signa Labs Inc.
        </p>
      </footer>
    </div>
  );
}
