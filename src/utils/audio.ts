import type * as ToneNS from 'tone';

const SOUND_PREF_KEY = 'gitalong:ui-sounds';

const readSoundPref = (): boolean => {
  try {
    return localStorage.getItem(SOUND_PREF_KEY) !== 'off';
  } catch {
    return true;
  }
};

/**
 * Subtle UI sounds. The on/off switch is a per-browser preference (Settings → Preferences).
 * Tone.js is only downloaded on the first click with sounds enabled, so it never
 * weighs on the initial page load.
 */
class AudioEngine {
  private static instance: AudioEngine;
  private synth: ToneNS.PolySynth | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private enabled = readSoundPref();

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem(SOUND_PREF_KEY, enabled ? 'on' : 'off');
    } catch {
      // storage unavailable — the choice still applies for this session
    }
  }

  public async init() {
    if (this.isInitialized || !this.enabled) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const Tone = await import('tone');
          await Tone.start();
          this.synth = new Tone.PolySynth(Tone.Synth, {
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 },
          }).toDestination();
          this.synth.volume.value = -18; // Soft volume for UI interactions
          this.isInitialized = true;
        } catch {
          // Audio not available (autoplay policy, no device, offline) — stay silent.
        } finally {
          this.initPromise = null;
        }
      })();
    }
    await this.initPromise;
  }

  public playHoverSound() {
    if (!this.isInitialized || !this.enabled || !this.synth) return;
    try {
      this.synth.triggerAttackRelease('C5', '64n');
    } catch {
      // ignore
    }
  }

  public playClickSound() {
    if (!this.isInitialized || !this.enabled || !this.synth) return;
    try {
      this.synth.triggerAttackRelease(['E5', 'G5'], '16n');
    } catch {
      // ignore
    }
  }
}

export const audioEngine = AudioEngine.getInstance();
