import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PressableButton } from './PressableButton';
import type { IllustrationName } from '../../lib/illustrations';
import { Illustration } from './Illustration';
import { EASE_OUT_CUBIC, usePrefersReducedMotion } from '../../lib/motion';
import { useDialog } from '../../lib/useDialog';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Prevent closing via backdrop/Escape (e.g. while a request is running). */
  busy?: boolean;
  /** Optional illustration above the title. */
  illustration?: IllustrationName;
  size?: 'md' | 'lg';
}

/**
 * Dialog in the Play style. On phones it is a bottom sheet (vertical slide +
 * fade, spec §4); on larger screens a centred tile.
 */
export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer, busy = false, illustration, size = 'md' }) => {
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialog(panelRef, open, { onEscape: busy ? undefined : onClose });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" key="modal">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !busy && onClose()}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 48 }}
            transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
            className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-xl border-2 border-b-0 border-border bg-card outline-none sm:rounded-xl sm:border-b-2 sm:shadow-edge-tile ${
              size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md'
            }`}
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-pill bg-border sm:hidden" aria-hidden />
            <div className="flex items-start gap-3 px-5 pb-2 pt-4 sm:px-6 sm:pt-6">
              <div className="min-w-0 flex-1">
                {illustration && <Illustration name={illustration} size={64} className="mb-3" />}
                <h2 id={titleId} className="text-h2 text-ink">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="-mr-2 -mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={3} aria-hidden />
              </button>
            </div>
            <div className="px-5 pb-5 text-body text-ink-muted sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-3 border-t-2 border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  illustration?: IllustrationName;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
  illustration,
}) => (
  <Modal
    open={open}
    title={title}
    onClose={onClose}
    busy={busy}
    illustration={illustration}
    footer={
      <>
        <PressableButton variant="secondary" onClick={onClose} disabled={busy} size="sm">
          Cancel
        </PressableButton>
        <PressableButton variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={busy} size="sm">
          {confirmLabel}
        </PressableButton>
      </>
    }
  >
    {message}
  </Modal>
);
