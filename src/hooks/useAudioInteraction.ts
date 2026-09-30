import { useEffect } from 'react';
import { audioEngine } from '../utils/audio';

const INTERACTIVE = 'button, a, .btn-primary, .btn-secondary, .card-modern, .input-modern';

/** Plays subtle hover/click sounds unless the user turned them off in Settings → Preferences. */
export const useAudioInteraction = () => {
  useEffect(() => {
    let lastHoverTarget: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      if (!audioEngine.isEnabled()) return;
      const interactiveEl = (e.target as HTMLElement).closest(INTERACTIVE) as HTMLElement | null;
      if (interactiveEl && interactiveEl !== lastHoverTarget) {
        lastHoverTarget = interactiveEl;
        audioEngine.playHoverSound();
      } else if (!interactiveEl) {
        lastHoverTarget = null;
      }
    };

    const handleMouseOut = () => {
      lastHoverTarget = null;
    };

    const handleClick = async (e: MouseEvent) => {
      if (!audioEngine.isEnabled()) return;
      // Browsers only allow audio after a user gesture; init is idempotent.
      await audioEngine.init();
      if ((e.target as HTMLElement).closest(INTERACTIVE)) {
        audioEngine.playClickSound();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);
};
