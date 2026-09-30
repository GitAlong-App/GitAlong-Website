import React from 'react';
import { IllustrationName, illustrationUrl } from '../../lib/illustrations';

export interface IllustrationProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'alt' | 'loading'> {
  name: IllustrationName;
  /** Rendered size in CSS px (square). */
  size?: number;
  /** Meaningful images get a label; decorative ones (the default) get empty alt text. */
  alt?: string;
  /** Above-the-fold art: load eagerly with high fetch priority. */
  priority?: boolean;
}

/**
 * A Fluent Emoji 3D illustration. Always has explicit width/height (no layout
 * shift) and lazy-loads unless `priority` is set.
 */
export const Illustration: React.FC<IllustrationProps> = ({
  name,
  size = 48,
  alt = '',
  priority = false,
  className = '',
  style,
  ...rest
}) => {
  // React 18 doesn't know the camelCase prop yet; the lowercase attribute passes through.
  const priorityAttr = (priority ? { fetchpriority: 'high' } : {}) as Record<string, string>;
  return (
    <img
      src={illustrationUrl(name)}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      {...priorityAttr}
      className={`pointer-events-none shrink-0 select-none ${className}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    />
  );
};
