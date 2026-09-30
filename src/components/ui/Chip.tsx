import React from 'react';
import { Check, X } from 'lucide-react';
import { Illustration } from './Illustration';
import type { IllustrationName } from '../../lib/illustrations';

/**
 * Chip (spec §3): pill, 2 px border, Caption type. Selected = green-tint +
 * green border. Removable variant shows ×.
 *
 * - With `onToggle` it is a toggle button (aria-pressed) with a ≥ 48 px hit area.
 * - With `onRemove` it shows a remove (×) button.
 * - Otherwise it is a static label.
 */
export type ChipTone = 'neutral' | 'green' | 'purple' | 'flame' | 'gold' | 'sky' | 'danger';

const TONE: Record<ChipTone, string> = {
  neutral: 'border-border bg-card text-ink-muted',
  green: 'border-green bg-green-tint text-green-fg',
  purple: 'border-purple bg-purple-tint text-purple-fg',
  flame: 'border-flame bg-flame-tint text-flame-fg',
  gold: 'border-gold bg-gold-tint text-gold-fg',
  sky: 'border-sky bg-sky-tint text-sky-fg',
  danger: 'border-danger bg-danger-tint text-danger-fg',
};

export interface ChipProps {
  children: React.ReactNode;
  /** Toggle chips: selected state. */
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  tone?: ChipTone;
  illustration?: IllustrationName;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  title?: string;
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  onToggle,
  onRemove,
  removeLabel,
  tone,
  illustration,
  icon,
  size = 'md',
  title,
  disabled = false,
  className = '',
}) => {
  const effectiveTone: ChipTone = tone ?? (selected ? 'green' : 'neutral');
  const sizing = size === 'sm' ? 'min-h-[28px] px-2.5 gap-1' : 'min-h-[40px] px-3.5 gap-1.5';
  const art = illustration ? <Illustration name={illustration} size={size === 'sm' ? 16 : 20} className="-ml-0.5" /> : null;
  const base = `relative inline-flex max-w-full items-center rounded-pill border-2 type-caption leading-none ${sizing} ${TONE[effectiveTone]}`;

  if (onToggle) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        title={title}
        disabled={disabled}
        onClick={onToggle}
        className={`${base} select-none transition-[transform,background-color,border-color,color] duration-150 before:absolute before:-inset-1 before:content-[''] hover:border-border-strong active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
          selected ? 'hover:border-green' : 'hover:text-ink'
        } ${className}`}
      >
        {selected ? <Check className="-ml-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={4} aria-hidden /> : art}
        {!selected && icon}
        <span className="truncate">{children}</span>
      </button>
    );
  }

  return (
    <span title={title} className={`${base} ${onRemove ? 'pr-1' : ''} ${className}`}>
      {art}
      {icon}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? 'Remove'}
          className="relative ml-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-ink/10 before:absolute before:-inset-2.5 before:content-['']"
        >
          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        </button>
      )}
    </span>
  );
};
