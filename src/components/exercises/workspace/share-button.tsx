'use client';

import { useState, useCallback } from 'react';
import { Share2, Copy, Check, X, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ShareButtonProps = {
  exerciseId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
};

export function ShareButton({ exerciseId, initialIsPublic, initialSlug }: ShareButtonProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = slug ? `${window.location.origin}/e/${slug}` : null;

  const handleShare = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error?.message || 'Failed to share');
      }

      const data = await response.json();
      setSlug(data.slug);
      setIsPublic(true);
      setShowDialog(true);
      toast.success('Exercise shared!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to share exercise');
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  const handleUnshare = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unshare');
      }

      setSlug(null);
      setIsPublic(false);
      setShowDialog(false);
      toast.success('Exercise unshared');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unshare exercise');
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [shareUrl]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground gap-1.5"
        onClick={isPublic ? () => setShowDialog(true) : handleShare}
        disabled={isLoading}
      >
        <Share2 className="h-3.5 w-3.5" />
        {isPublic ? 'Shared' : 'Share'}
      </Button>

      {/* Share dialog */}
      {showDialog && shareUrl && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
            {/* Header with gradient accent */}
            <div className="relative border-b border-border/40 bg-linear-to-br from-primary/10 via-transparent to-violet-500/5 px-6 py-5">
              <button
                onClick={() => setShowDialog(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Share Exercise</h3>
                  <p className="text-xs text-muted-foreground">Anyone with the link can try this exercise</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Share URL */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Share link</label>
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm font-mono">{shareUrl}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Social share links */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Share on social</label>
                <div className="flex gap-2">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-sky-500/30 hover:bg-sky-500/5 hover:text-sky-500 hover:shadow-sm"
                    onClick={() => {
                      const text = encodeURIComponent(`Can you solve this? Check out this exercise on Signa Labs!`);
                      const url = encodeURIComponent(shareUrl);
                      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                    }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Post on X
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-500 hover:shadow-sm"
                    onClick={() => {
                      const url = encodeURIComponent(shareUrl);
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                    }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Share on LinkedIn
                  </button>
                </div>
              </div>

              {/* Divider + Unshare */}
              <div className="border-t border-border/40 pt-4">
                <button
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                  onClick={handleUnshare}
                  disabled={isLoading}
                >
                  {isLoading ? 'Removing...' : 'Remove public link'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
