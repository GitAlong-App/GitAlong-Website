import React from 'react';

/** A chunky on/off switch (role="switch") with a ≥ 48 px hit area. */
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false, className = '' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`group relative inline-flex h-12 w-16 shrink-0 items-center justify-center rounded-pill tap-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    <span
      aria-hidden
      className={`relative h-8 w-14 rounded-pill border-2 transition-colors duration-200 ${
        checked ? 'border-green-edge bg-green' : 'border-border-strong bg-border'
      }`}
    >
      <span
        className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_0_0_rgba(15,23,42,0.18)] transition-transform duration-200 ease-out-back ${
          checked ? 'translate-x-[26px]' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
);
