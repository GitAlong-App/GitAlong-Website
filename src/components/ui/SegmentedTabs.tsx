import React, { useId, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * SegmentedTabs (spec §3): pill container; the active segment is white with a
 * bottom edge. Works as tabs (`role="tablist"`) or as a single choice
 * (`role="radiogroup"`). Arrow keys move the selection.
 */
export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** id of the panel this tab controls (tabs mode). */
  controls?: string;
}

export interface SegmentedTabsProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  kind?: 'tabs' | 'radio';
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  kind = 'tabs',
  fullWidth = false,
  className = '',
}: SegmentedTabsProps<T>) {
  const groupId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role={kind === 'tabs' ? 'tablist' : 'radiogroup'}
      aria-label={ariaLabel}
      className={`${fullWidth ? 'flex w-full' : 'inline-flex max-w-full'} gap-1 overflow-x-auto rounded-pill border-2 border-border bg-surface p-1 ${className}`}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={kind === 'tabs' ? 'tab' : 'radio'}
            aria-selected={kind === 'tabs' ? active : undefined}
            aria-checked={kind === 'radio' ? active : undefined}
            aria-controls={opt.controls}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-4 type-caption transition-colors duration-200 ${
              fullWidth ? 'flex-1' : ''
            } ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}
          >
            {active && (
              <motion.span
                layoutId={`segment-${groupId}`}
                aria-hidden
                className="absolute inset-0 rounded-pill border-2 border-border bg-card shadow-edge-tile"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            {opt.icon && <span className="relative flex items-center [&>svg]:h-4 [&>svg]:w-4">{opt.icon}</span>}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
