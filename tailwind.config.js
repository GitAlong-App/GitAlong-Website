/**
 * GitAlong "Play" design tokens — docs/DESIGN_SYSTEM.md §2 in the main repo.
 *
 * Brand hues are constants. Theme-dependent tokens (bg, surface, card, border,
 * ink, tints, readable "fg" text shades) are CSS variables holding RGB channels,
 * defined for light and dark in src/index.css, so opacity modifiers still work
 * (e.g. `bg-green-tint/60`).
 *
 * Depth: no blurry shadows. `shadow-edge-*` draws the solid 3D bottom edge
 * (buttons 4 px in the darker shade, tiles 3 px in border-strong).
 */
import plugin from 'tailwindcss/plugin';

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const brand = {
  green: { DEFAULT: '#16A34A', edge: '#117A38', bright: '#22C55E', tint: v('green-tint'), fg: v('green-fg') },
  purple: { DEFAULT: '#7C3AED', edge: '#5B21B6', tint: v('purple-tint'), fg: v('purple-fg') },
  flame: { DEFAULT: '#F97316', edge: '#C2410C', tint: v('flame-tint'), fg: v('flame-fg') },
  gold: { DEFAULT: '#F59E0B', edge: '#B45309', tint: v('gold-tint'), fg: v('gold-fg') },
  sky: { DEFAULT: '#0EA5E9', edge: '#0369A1', tint: v('sky-tint'), fg: v('sky-fg') },
  danger: { DEFAULT: '#EF4444', edge: '#B91C1C', tint: v('danger-tint'), fg: v('danger-fg') },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...brand,
        ink: { DEFAULT: v('ink'), muted: v('ink-muted'), subtle: v('ink-subtle') },
        bg: v('bg'),
        surface: v('surface'),
        card: v('card'),
        border: { DEFAULT: v('border'), strong: v('border-strong') },
        disabled: { DEFAULT: v('disabled'), edge: v('disabled-edge') },
        /** Fixed dark fill for the GitHub sign-in button (spec §7 Login). */
        github: { DEFAULT: '#0F172A', edge: '#020617' },
      },
      fontFamily: {
        sans: ['Nunito', 'Nunito Fallback', 'ui-rounded', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        display: ['34px', { lineHeight: '1.1', letterSpacing: '-0.5px', fontWeight: '900' }],
        h1: ['28px', { lineHeight: '1.2', letterSpacing: '-0.25px', fontWeight: '900' }],
        h2: ['22px', { lineHeight: '1.25', fontWeight: '800' }],
        h3: ['18px', { lineHeight: '1.3', fontWeight: '800' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-sm': ['14px', { lineHeight: '1.45', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '1.3', letterSpacing: '0.8px', fontWeight: '800' }],
        button: ['17px', { lineHeight: '1', letterSpacing: '0.8px', fontWeight: '800' }],
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
        pill: '999px',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        // Buttons: 4 px edge in the darker shade.
        'edge-green': '0 4px 0 0 #117A38',
        'edge-purple': '0 4px 0 0 #5B21B6',
        'edge-flame': '0 4px 0 0 #C2410C',
        'edge-gold': '0 4px 0 0 #B45309',
        'edge-sky': '0 4px 0 0 #0369A1',
        'edge-danger': '0 4px 0 0 #B91C1C',
        'edge-neutral': '0 4px 0 0 rgb(var(--border-strong))',
        // Tiles and cards: 3 px edge.
        'edge-tile': '0 3px 0 0 rgb(var(--border-strong))',
        'edge-tile-green': '0 3px 0 0 #117A38',
        'edge-tile-gold': '0 3px 0 0 #B45309',
        'edge-tile-purple': '0 3px 0 0 #5B21B6',
        'edge-tile-flame': '0 3px 0 0 #C2410C',
        'edge-tile-danger': '0 3px 0 0 #B91C1C',
        'edge-tile-sky': '0 3px 0 0 #0369A1',
        'edge-none': '0 0 0 0 transparent',
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        18: '4.5rem',
      },
      transitionTimingFunction: {
        'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        90: '90ms',
        250: '250ms',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        'shine-once': {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        bob: 'bob 3.2s ease-in-out infinite',
        pop: 'pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shine-once': 'shine-once 1.1s ease-out 0.2s 1 both',
        'fade-up': 'fade-up 300ms cubic-bezier(0.33, 1, 0.68, 1) both',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, addComponents }) => {
      // Caption / button label type (the spec's UPPERCASE styles).
      addComponents({
        '.type-caption': {
          fontSize: '12px',
          lineHeight: '1.3',
          letterSpacing: '0.8px',
          fontWeight: '800',
          textTransform: 'uppercase',
        },
        '.type-button': {
          fontSize: '17px',
          lineHeight: '1',
          letterSpacing: '0.8px',
          fontWeight: '800',
          textTransform: 'uppercase',
        },
      });
      addUtilities({
        // Keeps rounded clipping of transformed children in Safari.
        '.clip-rounded': { isolation: 'isolate', transform: 'translateZ(0)' },
        '.tap-transparent': { '-webkit-tap-highlight-color': 'transparent' },
      });
    }),
  ],
};
