'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Standard hydration guard for next-themes SSR */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) return <div className="size-9" />;

  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="text-muted-foreground hover:bg-accent/50 hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
      aria-label={`Switch to ${nextTheme} theme`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
