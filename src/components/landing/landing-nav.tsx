'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-black/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-white">
          Signa Labs
        </Link>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Button asChild variant="default" size="sm">
              <Link href="/dashboard">
                Dashboard
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                <Link href="/discover">Explore</Link>
              </Button>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/discover">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
