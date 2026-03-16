'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/navigation/top-nav';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { Footer } from '@/components/navigation/footer';
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider';
import { GuidedTour } from '@/components/onboarding/guided-tour';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isExerciseWorkspace =
    (/^\/exercises\/[^/]+$/.test(pathname) && pathname !== '/exercises/generate') ||
    /^\/e\/[^/]+$/.test(pathname);

  if (isExerciseWorkspace) {
    return <div className="h-screen flex flex-col bg-background">{children}</div>;
  }

  return (
    <OnboardingProvider>
      <div className="flex min-h-screen flex-col">
        {/* Desktop top nav */}
        <div className="hidden md:block">
          <TopNav />
        </div>
        {/* Mobile nav */}
        <MobileNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <GuidedTour />
    </OnboardingProvider>
  );
}
