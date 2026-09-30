import React, { useEffect, useState } from 'react';

/**
 * ProgressRing (spec §3): circular progress (e.g. profile strength around the
 * avatar), stroke 6, rounded caps. Content (an avatar, a number) goes in the
 * middle.
 */
const STROKE: Record<'green' | 'purple' | 'gold' | 'flame', string> = {
  green: 'stroke-green-bright',
  purple: 'stroke-purple',
  gold: 'stroke-gold',
  flame: 'stroke-flame',
};

export interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  variant?: keyof typeof STROKE;
  /** Accessible name, e.g. "Profile strength". Omit when the ring is decorative. */
  label?: string;
  valueText?: string;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 64,
  stroke = 6,
  variant = 'green',
  label,
  valueText,
  children,
  className = '',
}) => {
  const target = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(target * 100);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      {...(label
        ? {
            role: 'progressbar',
            'aria-label': label,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-valuenow': pct,
            'aria-valuetext': valueText ?? `${pct}%`,
          }
        : {})}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          className={`${STROKE[variant]} transition-[stroke-dashoffset] duration-500 ease-out-cubic`}
          style={{ opacity: shown > 0 ? 1 : 0 }}
        />
      </svg>
      <div className="relative flex items-center justify-center">{children}</div>
    </div>
  );
};
