import React from 'react';
import { intentLabel, isIntent } from '../lib/collab';
import { intentArt } from '../lib/illustrations';
import { Chip } from './ui/Chip';

interface IntentChipsProps {
  values: string[] | null | undefined;
  size?: 'xs' | 'sm';
  /** Intents to highlight in green (e.g. ones that fit yours). */
  highlight?: ReadonlySet<string>;
  className?: string;
}

/** Read-only chips for a profile's `looking_for` intents, each with its illustration. */
export const IntentChips: React.FC<IntentChipsProps> = ({ values, size = 'sm', highlight, className = '' }) => {
  const intents = (values ?? []).filter(isIntent);
  if (intents.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {intents.map((intent) => (
        <Chip
          key={intent}
          size={size === 'xs' ? 'sm' : 'md'}
          illustration={intentArt(intent)}
          tone={highlight?.has(intent) ? 'green' : 'neutral'}
          title={highlight?.has(intent) ? 'Fits what you are looking for' : undefined}
        >
          {intentLabel(intent)}
        </Chip>
      ))}
    </div>
  );
};
