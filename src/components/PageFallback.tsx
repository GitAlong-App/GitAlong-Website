import React from 'react';
import { Illustration } from './ui/Illustration';

/** Shown while a lazily loaded page downloads: Octo bobbing, no layout jump. */
export const PageFallback: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => (
  <div
    className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[60vh]'}`}
    role="status"
    aria-live="polite"
  >
    <Illustration name="octopus" size={72} className="animate-bob" priority />
    <span className="sr-only">Loading…</span>
  </div>
);
