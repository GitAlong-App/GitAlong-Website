/**
 * Web haptics (spec §4: light on taps, medium on selection, a heavy pattern on
 * a match). Only browsers with the Vibration API (mostly Android) do anything.
 * Vibration is only attempted after the person has interacted with the page
 * (sticky user activation), so browsers never log a blocked-call intervention —
 * e.g. for a level-up celebration that appears on load.
 */
type Pattern = number | number[];

const vibrate = (pattern: Pattern) => {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    // Older browsers lack the UserActivation API: treat that as "no activation yet".
    if (!navigator.userActivation?.hasBeenActive) return;
    navigator.vibrate(pattern);
  } catch {
    // Unsupported or blocked: silently skip.
  }
};

export const haptics = {
  tap: () => vibrate(8),
  select: () => vibrate(16),
  match: () => vibrate([30, 60, 40, 60, 80]),
};
