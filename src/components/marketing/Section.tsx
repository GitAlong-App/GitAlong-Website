import React from 'react';
import { motion } from 'framer-motion';
import { inView } from '../../lib/motion';

/** Marketing section wrapper with the page gutters and max width. */
export const Section: React.FC<{
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  labelledBy?: string;
}> = ({ id, className = '', innerClassName = '', children, labelledBy }) => (
  <section id={id} aria-labelledby={labelledBy} className={`py-16 md:py-24 ${className}`}>
    <div className={`gutter mx-auto max-w-6xl ${innerClassName}`}>{children}</div>
  </section>
);

/** Eyebrow caption + H2 + intro paragraph. */
export const SectionHeading: React.FC<{
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}> = ({ id, eyebrow, title, intro, align = 'center', className = '' }) => (
  <motion.div {...inView()} className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'} ${className}`}>
    {eyebrow && <p className="mb-3 type-caption text-green-fg">{eyebrow}</p>}
    <h2 id={id} className="text-[30px] font-black leading-[1.1] tracking-[-0.5px] text-ink sm:text-[40px]">
      {title}
    </h2>
    {intro && <p className="mt-4 text-[18px] font-semibold leading-relaxed text-ink-muted">{intro}</p>}
  </motion.div>
);

/** Page hero for secondary marketing pages. */
export const PageHero: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  art?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ eyebrow, title, intro, art, children }) => (
  <section className="relative overflow-hidden border-b-2 border-border bg-surface">
    <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-tint" />
    <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-sky-tint/70" />
    <div className="gutter relative mx-auto flex max-w-6xl flex-col items-center gap-6 py-14 text-center md:flex-row md:py-20 md:text-left">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="mb-3 type-caption text-green-fg">{eyebrow}</p>}
        <h1 className="text-[36px] font-black leading-[1.05] tracking-[-0.5px] text-ink sm:text-[48px]">{title}</h1>
        {intro && <p className="mx-auto mt-4 max-w-2xl text-[18px] font-semibold leading-relaxed text-ink-muted md:mx-0">{intro}</p>}
        {children}
      </div>
      {art && <div className="shrink-0">{art}</div>}
    </div>
  </section>
);
