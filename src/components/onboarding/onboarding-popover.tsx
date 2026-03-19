'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

type OnboardingPopoverProps = {
  targetSelector: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function OnboardingPopover({
  targetSelector,
  side = 'bottom',
  open,
  onClose,
  children,
}: OnboardingPopoverProps) {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const virtualRef = useRef({
    getBoundingClientRect: () => anchorRect ?? new DOMRect(0, 0, 0, 0),
  });

  useEffect(() => {
    if (!open) return;

    function updateRect() {
      const el = document.querySelector(targetSelector);
      if (el) {
        setAnchorRect(el.getBoundingClientRect());
      }
    }

    // Initial + slight delay for layout shifts
    updateRect();
    const timer = setTimeout(updateRect, 100);

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open, targetSelector]);

  if (!open || !anchorRect) return null;

  return (
    <PopoverPrimitive.Root open={open}>
      <PopoverPrimitive.Anchor virtualRef={virtualRef} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          sideOffset={8}
          align="center"
          avoidCollisions
          collisionPadding={16}
          className={cn(
            'border-border border-l-primary bg-popover z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-l-2 p-4 shadow-lg',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <button
            onClick={onClose}
            className="text-muted-foreground/60 hover:text-foreground absolute top-2 right-2 rounded-md p-1 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {children}
          <PopoverPrimitive.Arrow className="fill-popover" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
