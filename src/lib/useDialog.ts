import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open dialogs, top-most last: only the top one handles keys. */
const stack: symbol[] = [];

/**
 * Dialog behaviour for overlays: moves focus inside, keeps Tab within the
 * dialog, closes on Escape, locks page scroll, and restores focus on close.
 */
export function useDialog(
  ref: RefObject<HTMLElement>,
  open: boolean,
  options: { onEscape?: () => void; initialFocus?: RefObject<HTMLElement> } = {}
) {
  const onEscapeRef = useRef(options.onEscape);
  onEscapeRef.current = options.onEscape;
  const initialFocus = options.initialFocus;

  useEffect(() => {
    if (!open) return;
    const token = Symbol('dialog');
    const previouslyFocused = document.activeElement as HTMLElement | null;

    stack.push(token);
    if (stack.length === 1) document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => {
      const root = ref.current;
      if (!root) return;
      const target = initialFocus?.current ?? root.querySelector<HTMLElement>(FOCUSABLE) ?? root;
      target.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== token) return;
      const root = ref.current;
      if (!root) return;
      if (e.key === 'Escape') {
        if (onEscapeRef.current) {
          e.stopPropagation();
          onEscapeRef.current();
        }
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
      if (items.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      const i = stack.indexOf(token);
      if (i >= 0) stack.splice(i, 1);
      if (stack.length === 0) document.body.style.overflow = '';
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, ref, initialFocus]);
}
