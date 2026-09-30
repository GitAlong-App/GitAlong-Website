import React from 'react';
import { haptics } from '../../lib/haptics';

/**
 * CircleActionButton: the big round 3D buttons under the Discover card
 * (Nope = danger, Super = purple, Like = green). Pressing moves the face
 * down over its edge (transform only).
 */
export type CircleVariant = 'danger' | 'purple' | 'green' | 'neutral';

const FACE: Record<CircleVariant, string> = {
  danger: 'bg-danger text-white',
  purple: 'bg-purple text-white',
  green: 'bg-green text-white',
  neutral: 'bg-card text-ink border-2 border-border',
};
const EDGE: Record<CircleVariant, string> = {
  danger: 'bg-danger-edge',
  purple: 'bg-purple-edge',
  green: 'bg-green-edge',
  neutral: 'bg-border-strong',
};

export interface CircleActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant: CircleVariant;
  /** Accessible name (also the visible caption unless `caption` is set). */
  label: string;
  icon: React.ReactNode;
  size?: number;
  caption?: string | false;
  /** Extra classes for the visible caption (e.g. hide it on small screens). */
  captionClassName?: string;
}

export const CircleActionButton = React.forwardRef<HTMLButtonElement, CircleActionButtonProps>(function CircleActionButton(
  { variant, label, icon, size = 64, caption, captionClassName = '', className = '', onClick, type = 'button', ...rest },
  ref
) {
  const edge = Math.round(size * 0.08);
  const visibleCaption = caption === false ? null : caption ?? label;
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      onClick={(e) => {
        haptics.tap();
        onClick?.(e);
      }}
      className={`group flex select-none flex-col items-center gap-2 rounded-lg p-1 tap-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      <span className="relative block" style={{ width: size, height: size + edge, paddingBottom: edge }}>
        <span aria-hidden className={`absolute inset-x-0 bottom-0 rounded-full ${EDGE[variant]}`} style={{ top: edge }} />
        <span
          className={`relative flex h-full w-full items-center justify-center rounded-full transition-transform duration-90 ease-out group-hover:brightness-105 group-active:translate-y-[var(--edge)] group-disabled:!translate-y-0 [&>svg]:drop-shadow-sm ${FACE[variant]}`}
          style={{ ['--edge' as string]: `${edge}px` }}
        >
          <span className="flex items-center justify-center transition-transform duration-150 group-hover:scale-110 group-active:scale-95">
            {icon}
          </span>
        </span>
      </span>
      {visibleCaption && (
        <span aria-hidden className={`type-caption text-ink-muted group-hover:text-ink ${captionClassName}`}>
          {visibleCaption}
        </span>
      )}
    </button>
  );
});
