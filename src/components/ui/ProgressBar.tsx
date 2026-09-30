import React, { useEffect, useState } from 'react';

/**
 * ProgressBar (spec §3): height 16, pill, `surface` track. The fill is
 * `green-bright` with a glossy highlight band (30% white, 4 px high, inset
 * 4 px from the top) and animates over 500 ms ease-out.
 *
 * The fill is a full-width pill that slides in with `translateX`, so the
 * animation is transform-only and the rounded end never distorts.
 */
export type ProgressVariant = 'green' | 'flame' | 'gold' | 'purple';

const FILL: Record<ProgressVariant, string> = {
  green: 'bg-green-bright',
  flame: 'bg-flame',
  gold: 'bg-gold',
  purple: 'bg-purple',
};

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  variant?: ProgressVariant;
  size?: 'md' | 'sm';
  /** Accessible name, e.g. "Daily goal". */
  label: string;
  /** Spoken value, e.g. "6 of 10 builders". */
  valueText?: string;
  /** Animate in from 0 on mount (default true). */
  animateOnMount?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'green',
  size = 'md',
  label,
  valueText,
  animateOnMount = true,
  className = '',
}) => {
  const target = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const [shown, setShown] = useState(animateOnMount ? 0 : target);

  useEffect(() => {
    // Next frame, so the mount → value change is animated.
    const raf = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const pct = Math.round(target * 100);
  const height = size === 'sm' ? 'h-2.5' : 'h-4';

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText}
      className={`relative w-full overflow-hidden rounded-pill bg-surface ring-2 ring-inset ring-border clip-rounded ${height} ${className}`}
    >
      <div
        className={`absolute inset-0 rounded-pill ${FILL[variant]} transition-transform duration-500 ease-out-cubic will-change-transform`}
        style={{ transform: `translateX(${(shown - 1) * 100}%)` }}
      >
        <div
          aria-hidden
          className={`absolute rounded-pill bg-white/30 ${size === 'sm' ? 'left-1.5 right-1.5 top-0.5 h-0.5' : 'left-2 right-2 top-1 h-1'}`}
        />
      </div>
    </div>
  );
};
