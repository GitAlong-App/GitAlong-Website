import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Chip } from './ui/Chip';
import type { IllustrationName } from '../lib/illustrations';

interface ChipSelectProps {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  /** Optional display label for an option key. */
  labelFor?: (option: string) => string;
  /** Optional illustration for an option key. */
  illustrationFor?: (option: string) => IllustrationName | undefined;
  /** Allow typing values that are not in `options`. */
  allowCustom?: boolean;
  customPlaceholder?: string;
  max?: number;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

/** Multi-select chip group (Play Chips). Keeps any selected values that are not in `options` visible. */
export const ChipSelect: React.FC<ChipSelectProps> = ({
  options,
  value,
  onChange,
  labelFor = (o) => o,
  illustrationFor,
  allowCustom = false,
  customPlaceholder = 'Add another…',
  max,
  ariaLabel,
}) => {
  const [custom, setCustom] = useState('');
  const lowerSelected = new Set(value.map((v) => v.toLowerCase()));
  const extra = value.filter((v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()));
  const all = [...options, ...extra];
  const atMax = typeof max === 'number' && value.length >= max;

  const toggle = (option: string) => {
    const isOn = lowerSelected.has(option.toLowerCase());
    if (isOn) {
      onChange(value.filter((v) => v.toLowerCase() !== option.toLowerCase()));
    } else if (!atMax) {
      onChange([...value, option]);
    }
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v || lowerSelected.has(v.toLowerCase()) || atMax) {
      setCustom('');
      return;
    }
    const canonical = options.find((o) => o.toLowerCase() === v.toLowerCase()) ?? v.slice(0, 40);
    onChange([...value, canonical]);
    setCustom('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {all.map((option) => {
          const on = lowerSelected.has(option.toLowerCase());
          return (
            <Chip
              key={option}
              selected={on}
              onToggle={() => toggle(option)}
              disabled={!on && atMax}
              illustration={illustrationFor?.(option)}
            >
              {labelFor(option)}
            </Chip>
          );
        })}
      </div>
      {allowCustom && (
        <div className="mt-3 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={40}
            placeholder={customPlaceholder}
            aria-label={customPlaceholder}
            disabled={atMax}
            className="field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={atMax || !custom.trim()}
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-md border-2 border-border bg-card px-4 type-caption text-ink transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" strokeWidth={3} aria-hidden /> Add
          </button>
        </div>
      )}
      {typeof max === 'number' && (
        <p className="mt-2 text-body-sm text-ink-muted">
          {value.length}/{max} selected
        </p>
      )}
    </div>
  );
};
