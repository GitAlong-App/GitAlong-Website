import React from 'react';
import { APK_RELEASES_URL } from '../lib/links';

interface AppStoreButtonProps {
  platform: 'ios' | 'android';
  className?: string;
}

const AndroidIcon = () => (
  <svg className="h-7 w-7 shrink-0 text-green" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-7 w-7 shrink-0 opacity-60" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

/**
 * Mobile download buttons. GitAlong is not in the App Store or Google Play yet:
 * Android beta builds are published as APKs on GitHub Releases, iOS is coming later.
 */
export const AppStoreButton: React.FC<AppStoreButtonProps> = ({ platform, className = '' }) => {
  if (platform === 'ios') {
    return (
      <span
        role="img"
        aria-label="iOS app coming soon"
        title="The iOS app isn't available yet"
        className={`inline-flex min-h-[56px] cursor-not-allowed select-none items-center gap-3 rounded-md border-2 border-dashed border-border-strong bg-surface px-4 py-2 text-ink-muted ${className}`}
      >
        <AppleIcon />
        <span className="text-left leading-tight">
          <span className="block text-[11px] font-black uppercase tracking-[0.8px]">iPhone</span>
          <span className="block text-[15px] font-extrabold">iOS coming soon</span>
        </span>
      </span>
    );
  }

  return (
    <a
      href={APK_RELEASES_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex select-none rounded-md pb-1 tap-transparent ${className}`}
    >
      <span aria-hidden className="absolute inset-x-0 bottom-0 top-1 rounded-md bg-border-strong" />
      <span className="relative flex min-h-[52px] w-full items-center gap-3 rounded-md border-2 border-border bg-card px-4 py-2 text-ink transition-transform duration-90 ease-out group-hover:border-border-strong group-active:translate-y-1">
        <AndroidIcon />
        <span className="text-left leading-tight">
          <span className="block text-[11px] font-black uppercase tracking-[0.8px] text-ink-muted">Android beta</span>
          <span className="block text-[15px] font-extrabold">Download the APK</span>
        </span>
      </span>
    </a>
  );
};
