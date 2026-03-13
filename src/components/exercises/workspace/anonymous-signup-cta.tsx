'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, CheckCircle2, XCircle, Lightbulb, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CTAVariant = 'pass' | 'fail' | 'hint' | 'explain';

const VARIANT_CONFIG: Record<
  CTAVariant,
  {
    icon: typeof CheckCircle2;
    iconColor: string;
    title: string;
    description: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  pass: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    title: 'Great job! Save your progress',
    description:
      'Sign up to track your streak, unlock AI-powered explanations, and continue with personalized learning paths.',
    bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  fail: {
    icon: XCircle,
    iconColor: 'text-amber-500',
    title: 'Get AI help to fix your code',
    description:
      'Sign up for free to get personalized explanations of what went wrong, smart hints, and step-by-step guidance.',
    bgColor: 'bg-amber-50/50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  hint: {
    icon: Lightbulb,
    iconColor: 'text-blue-500',
    title: 'Unlock more hints',
    description:
      'Sign up for free to access all hints, AI explanations, and save your progress across sessions.',
    bgColor: 'bg-blue-50/50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  explain: {
    icon: BookOpen,
    iconColor: 'text-violet-500',
    title: 'Get AI-powered explanations',
    description:
      'Sign up for free to unlock personalized code analysis, failure explanations, and learning syntheses.',
    bgColor: 'bg-violet-50/50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
};

type AnonymousSignupCTAProps = {
  variant: CTAVariant;
};

export function AnonymousSignupCTA({ variant }: AnonymousSignupCTAProps) {
  const pathname = usePathname();
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={`border-t ${config.borderColor} ${config.bgColor} px-4 py-4`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{config.title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
          <div className="mt-3">
            <Link href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}>
              <Button size="sm" className="gap-2">
                <LogIn className="h-3.5 w-3.5" />
                Sign up free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
