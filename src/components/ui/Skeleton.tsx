import React from 'react';

/**
 * Skeleton (spec §3): rounded blocks with a soft shimmer, for every async list
 * or card. The shimmer is a transform-only sweep and stops with reduced motion.
 */
export interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'pill' | 'full';
  style?: React.CSSProperties;
}

const ROUND = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', pill: 'rounded-pill', full: 'rounded-full' } as const;

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = 'md', style }) => (
  <div
    aria-hidden
    style={style}
    className={`relative overflow-hidden bg-border/60 clip-rounded ${ROUND[rounded]} after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent after:content-[''] dark:after:via-white/10 ${className}`}
  />
);

/** A tile-shaped placeholder with an avatar and a few lines. */
export const SkeletonRow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 rounded-lg border-2 border-border bg-card p-3 ${className}`} aria-hidden>
    <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-2/5" rounded="pill" />
      <Skeleton className="h-3 w-4/5" rounded="pill" />
    </div>
  </div>
);

/** Screen-reader text for a loading region. */
export const LoadingLabel: React.FC<{ children?: React.ReactNode }> = ({ children = 'Loading…' }) => (
  <span className="sr-only" role="status">
    {children}
  </span>
);
