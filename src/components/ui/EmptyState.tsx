import React from 'react';
import { Illustration } from './Illustration';
import type { IllustrationName } from '../../lib/illustrations';

/**
 * EmptyState (spec §3): illustration 120 px + H2 + Body + optional primary
 * button. Always friendly ("No one yet, want to widen your filters?").
 */
export interface EmptyStateProps {
  illustration: IllustrationName;
  title: string;
  message?: React.ReactNode;
  /** Buttons/links. */
  action?: React.ReactNode;
  size?: 'md' | 'sm';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ illustration, title, message, action, size = 'md', className = '' }) => (
  <div className={`mx-auto flex max-w-md flex-col items-center text-center ${size === 'sm' ? 'py-6' : 'py-10'} ${className}`}>
    <Illustration name={illustration} size={size === 'sm' ? 80 : 120} className="animate-fade-up" />
    <h2 className={`mt-4 ${size === 'sm' ? 'text-h3' : 'text-h2'} text-ink`}>{title}</h2>
    {message && <div className="mt-2 text-body text-ink-muted">{message}</div>}
    {action && <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">{action}</div>}
  </div>
);
