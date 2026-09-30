import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Illustration } from './Illustration';
import type { IllustrationName } from '../../lib/illustrations';
import { haptics } from '../../lib/haptics';

/**
 * PressableButton (spec §3): filled, radius 16, height 52, 4 px bottom edge in
 * the darker shade. On press the face moves down 4 px and covers the edge
 * (transform only, 90 ms), then springs back.
 *
 * The edge is a separate layer under the face, so pressing never animates
 * box-shadow or layout — just `transform`.
 */
export type PressableVariant = 'primary' | 'secondary' | 'purple' | 'flame' | 'danger' | 'ghost' | 'ink' | 'inverse';
export type PressableSize = 'sm' | 'md' | 'lg';

const FACE: Record<PressableVariant, string> = {
  primary: 'bg-green text-white border-transparent',
  secondary: 'bg-card text-ink border-border',
  purple: 'bg-purple text-white border-transparent',
  flame: 'bg-flame text-white border-transparent',
  danger: 'bg-danger text-white border-transparent',
  ghost: 'bg-transparent text-green-fg border-transparent group-hover:bg-green-tint/70',
  ink: 'bg-github text-white border-transparent dark:bg-white dark:text-github',
  inverse: 'bg-white text-green-edge border-transparent',
};

const EDGE: Record<PressableVariant, string | null> = {
  primary: 'bg-green-edge',
  secondary: 'bg-border-strong',
  purple: 'bg-purple-edge',
  flame: 'bg-flame-edge',
  danger: 'bg-danger-edge',
  ghost: null,
  ink: 'bg-github-edge dark:bg-[#94A3B8]',
  inverse: 'bg-[#BBF7D0]',
};

const SHEEN: Record<PressableVariant, string> = {
  primary: 'bg-white group-hover:opacity-[0.12]',
  secondary: 'bg-ink group-hover:opacity-[0.04]',
  purple: 'bg-white group-hover:opacity-[0.12]',
  flame: 'bg-white group-hover:opacity-[0.12]',
  danger: 'bg-white group-hover:opacity-[0.12]',
  ghost: 'hidden',
  ink: 'bg-white group-hover:opacity-[0.12] dark:bg-github dark:group-hover:opacity-[0.06]',
  inverse: 'bg-green group-hover:opacity-[0.06]',
};

const SIZE: Record<PressableSize, string> = {
  sm: 'h-11 px-4 text-[15px] gap-2',
  md: 'h-13 px-5 text-[17px] gap-2.5',
  lg: 'h-14 px-7 text-[18px] gap-3',
};

interface PressableOwnProps {
  variant?: PressableVariant;
  size?: PressableSize;
  /** `'mobile'` (default): full width below the `sm` breakpoint, auto above. */
  fullWidth?: boolean | 'mobile';
  /** Optional 24 px illustration before the label. */
  leadingIllustration?: IllustrationName;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  /** Extra classes for the face (colour overrides etc.). */
  faceClassName?: string;
  className?: string;
  children: React.ReactNode;
}

const widthClass = (fullWidth: PressableOwnProps['fullWidth']) =>
  fullWidth === true ? 'w-full' : fullWidth === 'mobile' ? 'w-full sm:w-auto' : 'w-auto';

export const pressableOuterClass = (fullWidth: PressableOwnProps['fullWidth'], extra = '') =>
  `group relative inline-flex shrink-0 select-none rounded-md pb-1 align-middle tap-transparent disabled:cursor-not-allowed aria-disabled:cursor-not-allowed ${widthClass(
    fullWidth
  )} ${extra}`;

const PressableFace: React.FC<
  Pick<
    PressableOwnProps,
    'variant' | 'size' | 'leadingIllustration' | 'leadingIcon' | 'trailingIcon' | 'loading' | 'faceClassName' | 'children'
  >
> = ({ variant = 'primary', size = 'md', leadingIllustration, leadingIcon, trailingIcon, loading, faceClassName = '', children }) => {
  const edge = EDGE[variant];
  return (
    <>
      {edge && (
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 top-1 rounded-md ${edge} group-disabled:bg-disabled-edge group-aria-disabled:bg-disabled-edge`}
        />
      )}
      <span
        className={`relative flex w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-md border-2 font-extrabold uppercase tracking-[0.8px] transition-transform duration-90 ease-out ${
          SIZE[size]
        } ${FACE[variant]} ${
          edge ? 'group-active:translate-y-1' : ''
        } group-disabled:translate-y-0 group-disabled:border-transparent group-disabled:bg-disabled group-disabled:text-ink-subtle group-aria-disabled:translate-y-0 group-aria-disabled:border-transparent group-aria-disabled:bg-disabled group-aria-disabled:text-ink-subtle ${faceClassName}`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-disabled:!opacity-0 group-aria-disabled:!opacity-0 ${SHEEN[variant]}`}
        />
        {loading ? (
          <Loader2 className="relative h-5 w-5 animate-spin" aria-hidden />
        ) : leadingIllustration ? (
          <Illustration name={leadingIllustration} size={24} className="relative -my-1" />
        ) : leadingIcon ? (
          <span className="relative flex shrink-0 items-center [&>svg]:h-5 [&>svg]:w-5">{leadingIcon}</span>
        ) : null}
        <span className="relative truncate">{children}</span>
        {trailingIcon && !loading && (
          <span className="relative flex shrink-0 items-center [&>svg]:h-5 [&>svg]:w-5">{trailingIcon}</span>
        )}
      </span>
    </>
  );
};

export type PressableButtonProps = PressableOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export const PressableButton = React.forwardRef<HTMLButtonElement, PressableButtonProps>(function PressableButton(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = 'mobile',
    leadingIllustration,
    leadingIcon,
    trailingIcon,
    loading = false,
    faceClassName,
    className = '',
    children,
    type = 'button',
    disabled,
    onClick,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={(e) => {
        haptics.tap();
        onClick?.(e);
      }}
      className={pressableOuterClass(fullWidth, className)}
      {...rest}
    >
      <PressableFace
        variant={variant}
        size={size}
        leadingIllustration={leadingIllustration}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
        loading={loading}
        faceClassName={faceClassName}
      >
        {children}
      </PressableFace>
    </button>
  );
});

export type PressableLinkProps = PressableOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> &
  ({ to: string; href?: never; replace?: boolean; state?: unknown } | { href: string; to?: never });

/** Same look as PressableButton, for navigation: `to` renders a router Link, `href` an anchor. */
export const PressableLink: React.FC<PressableLinkProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = 'mobile',
    leadingIllustration,
    leadingIcon,
    trailingIcon,
    loading,
    faceClassName,
    className = '',
    children,
    ...rest
  } = props;
  const face = (
    <PressableFace
      variant={variant}
      size={size}
      leadingIllustration={leadingIllustration}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      loading={loading}
      faceClassName={faceClassName}
    >
      {children}
    </PressableFace>
  );
  const cls = pressableOuterClass(fullWidth, className);
  if ('to' in rest && typeof rest.to === 'string') {
    const { to, replace, state, ...anchorRest } = rest as { to: string; replace?: boolean; state?: unknown } & Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href'
    >;
    return (
      <Link to={to} replace={replace} state={state} className={cls} {...anchorRest}>
        {face}
      </Link>
    );
  }
  const { href, ...anchorRest } = rest as { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
  return (
    <a href={href} className={cls} {...anchorRest}>
      {face}
    </a>
  );
};
