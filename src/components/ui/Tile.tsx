import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Tile / Card (spec §3): white (`card` in dark), 2 px border, radius 20,
 * 3 px `border-strong` bottom edge, padding 16–20.
 *
 * Static tiles draw the edge with `shadow-edge-*`. Interactive tiles
 * (TileButton / TileLink) put the edge on its own layer so pressing only
 * animates transform.
 */
export type TileTone = 'default' | 'green' | 'gold' | 'purple' | 'flame' | 'sky' | 'danger' | 'surface';
export type TilePadding = 'none' | 'sm' | 'md' | 'lg';

const STATIC_TONE: Record<TileTone, string> = {
  default: 'bg-card border-border shadow-edge-tile',
  green: 'bg-green-tint border-green shadow-edge-tile-green',
  gold: 'bg-gold-tint border-gold shadow-edge-tile-gold',
  purple: 'bg-purple-tint border-purple shadow-edge-tile-purple',
  flame: 'bg-flame-tint border-flame shadow-edge-tile-flame',
  sky: 'bg-sky-tint border-sky shadow-edge-tile-sky',
  danger: 'bg-danger-tint border-danger shadow-edge-tile-danger',
  surface: 'bg-surface border-border',
};

const FACE_TONE: Record<TileTone, string> = {
  default: 'bg-card border-border group-hover:border-border-strong',
  green: 'bg-green-tint border-green',
  gold: 'bg-gold-tint border-gold',
  purple: 'bg-purple-tint border-purple',
  flame: 'bg-flame-tint border-flame',
  sky: 'bg-sky-tint border-sky',
  danger: 'bg-danger-tint border-danger',
  surface: 'bg-surface border-border group-hover:border-border-strong',
};

const EDGE_TONE: Record<TileTone, string> = {
  default: 'bg-border-strong',
  green: 'bg-green-edge',
  gold: 'bg-gold-edge',
  purple: 'bg-purple-edge',
  flame: 'bg-flame-edge',
  sky: 'bg-sky-edge',
  danger: 'bg-danger-edge',
  surface: 'bg-border',
};

export const PADDING: Record<TilePadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-7',
};

type TileElement = 'div' | 'section' | 'article' | 'aside' | 'li' | 'header' | 'figure';

export interface TileProps extends React.HTMLAttributes<HTMLElement> {
  as?: TileElement;
  tone?: TileTone;
  padding?: TilePadding;
}

export const Tile = React.forwardRef<HTMLElement, TileProps>(function Tile(
  { as = 'div', tone = 'default', padding = 'md', className = '', children, ...rest },
  ref
) {
  const Comp = as as React.ElementType;
  return (
    <Comp ref={ref} className={`rounded-lg border-2 ${STATIC_TONE[tone]} ${PADDING[padding]} ${className}`} {...rest}>
      {children}
    </Comp>
  );
});

interface PressableTileOwnProps {
  tone?: TileTone;
  padding?: TilePadding;
  /** Classes for the visible face (layout of the content). */
  faceClassName?: string;
  className?: string;
  children: React.ReactNode;
}

const outer = (className: string) =>
  `group relative block select-none rounded-lg pb-[3px] text-left tap-transparent disabled:cursor-not-allowed ${className}`;

const Face: React.FC<{
  tone: TileTone;
  padding: TilePadding;
  faceClassName: string;
  /** `span` inside buttons (phrasing content only), `div` inside links. */
  as: 'span' | 'div';
  children: React.ReactNode;
}> = ({ tone, padding, faceClassName, as: Inner, children }) => (
  <>
    <span aria-hidden className={`absolute inset-x-0 bottom-0 top-[3px] rounded-lg ${EDGE_TONE[tone]}`} />
    <Inner
      className={`relative block h-full rounded-lg border-2 transition-transform duration-90 ease-out group-active:translate-y-[3px] group-disabled:translate-y-0 ${FACE_TONE[tone]} ${PADDING[padding]} ${faceClassName}`}
    >
      {children}
    </Inner>
  </>
);

export type TileButtonProps = PressableTileOwnProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

/** A tappable tile (button). */
export const TileButton = React.forwardRef<HTMLButtonElement, TileButtonProps>(function TileButton(
  { tone = 'default', padding = 'md', faceClassName = '', className = '', children, type = 'button', ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={outer(className)} {...rest}>
      <Face as="span" tone={tone} padding={padding} faceClassName={faceClassName}>
        {children}
      </Face>
    </button>
  );
});

export type TileLinkProps = PressableTileOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> &
  ({ to: string; href?: never } | { href: string; to?: never });

/** A tile that navigates: `to` renders a router Link, `href` an anchor. */
export const TileLink: React.FC<TileLinkProps> = ({
  tone = 'default',
  padding = 'md',
  faceClassName = '',
  className = '',
  children,
  ...rest
}) => {
  const face = (
    <Face as="div" tone={tone} padding={padding} faceClassName={faceClassName}>
      {children}
    </Face>
  );
  if ('to' in rest && typeof rest.to === 'string') {
    const { to, ...anchorRest } = rest as { to: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
    return (
      <Link to={to} className={outer(className)} {...anchorRest}>
        {face}
      </Link>
    );
  }
  const { href, ...anchorRest } = rest as { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
  return (
    <a href={href} className={outer(className)} {...anchorRest}>
      {face}
    </a>
  );
};
