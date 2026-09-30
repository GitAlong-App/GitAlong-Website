import React, { useEffect, useState } from 'react';

const TONES = [
  'bg-green-tint text-green-fg',
  'bg-purple-tint text-purple-fg',
  'bg-sky-tint text-sky-fg',
  'bg-gold-tint text-gold-fg',
  'bg-flame-tint text-flame-fg',
] as const;

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const initialsOf = (name: string) => {
  const parts = name.replace(/[^\p{L}\p{N}\s-]/gu, ' ').trim().split(/[\s-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + second).toUpperCase();
};

export interface AvatarProps {
  src?: string | null;
  /** Used for the initials fallback and the alt text. */
  name: string;
  size?: number;
  /** Decorative avatars (next to a visible name) get empty alt text. */
  decorative?: boolean;
  className?: string;
  /** Green ring (e.g. new matches). */
  ring?: boolean;
  priority?: boolean;
}

/** Round avatar with a friendly initials fallback (no broken images, no external placeholder). */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 48,
  decorative = true,
  className = '',
  ring = false,
  priority = false,
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const ringClass = ring ? 'ring-[3px] ring-green-bright ring-offset-2 ring-offset-bg' : '';
  const style = { width: size, height: size };

  if (!src || failed) {
    const tone = TONES[hash(name || '?') % TONES.length];
    return (
      <span
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : name}
        aria-hidden={decorative ? true : undefined}
        className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-black ${tone} ${ringClass} ${className}`}
        style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.38)) }}
      >
        {initialsOf(name)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : name}
      width={size}
      height={size}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={`shrink-0 select-none rounded-full bg-surface object-cover ${ringClass} ${className}`}
      style={style}
    />
  );
};
