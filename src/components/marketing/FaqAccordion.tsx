import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../../lib/faqs';
import { EASE_OUT_CUBIC } from '../../lib/motion';

/**
 * FAQ accordions: each question is a tile-styled button (aria-expanded) that
 * reveals its answer with a fade (opacity/transform only — no height tween).
 */
export const FaqAccordion: React.FC<{ items: FaqItem[]; defaultOpen?: number }> = ({ items, defaultOpen = -1 }) => {
  const [open, setOpen] = useState<number>(defaultOpen);
  const baseId = useId();

  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        const buttonId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;
        return (
          <li key={item.question} className={`rounded-lg border-2 bg-card ${isOpen ? 'border-green shadow-edge-tile-green' : 'border-border shadow-edge-tile'}`}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-[60px] w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-h3 text-ink sm:px-5"
              >
                <span className="flex-1">{item.question}</span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-250 ease-out-cubic ${
                    isOpen ? 'rotate-180 border-green bg-green text-white' : 'border-border text-ink-muted'
                  }`}
                  aria-hidden
                >
                  <ChevronDown className="h-5 w-5" strokeWidth={3} />
                </span>
              </button>
            </h3>
            {isOpen && (
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT_CUBIC }}
                className="px-4 pb-5 text-body text-ink-muted sm:px-5"
              >
                {item.answer}
              </motion.div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
