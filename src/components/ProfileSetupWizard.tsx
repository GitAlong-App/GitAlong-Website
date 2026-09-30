import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { INTENTS, INTENT_LABELS, INTEREST_OPTIONS, LANGUAGE_OPTIONS, PITCH_MAX } from '../lib/collab';
import { INTENT_ART } from '../lib/illustrations';
import { INTENT_BLURBS } from '../lib/intentCopy';
import { profileChecks } from '../lib/progress';
import { EASE_OUT_CUBIC, usePrefersReducedMotion } from '../lib/motion';
import { useDialog } from '../lib/useDialog';
import { ChipSelect } from './ChipSelect';
import { Celebration, MascotBubble, OptionCard, PressableButton, ProgressBar } from './ui';

/**
 * Guided profile setup (docs/DESIGN_SYSTEM.md §7): one question per step with
 * a top ProgressBar and a back arrow. Saves once at the end with the same
 * `saveProfile` the Settings editor uses, then celebrates.
 */
interface Answers {
  looking_for: string[];
  languages: string[];
  interests: string[];
  seeking_skills: string[];
  pitch: string;
}

type StepId = 'intents' | 'languages' | 'interests' | 'skills' | 'pitch';

const STEPS: Array<{ id: StepId; octo: string; hint?: string; optional?: boolean }> = [
  { id: 'intents', octo: 'What brings you here? Pick everything that fits.' },
  { id: 'languages', octo: 'Which languages do you work in?', hint: 'We pre-filled these from your GitHub. Add or remove any.' },
  { id: 'interests', octo: 'What are you into?', hint: 'Shared interests help me find people you’ll click with.' },
  {
    id: 'skills',
    octo: 'Which skills should your collaborator bring?',
    hint: 'Optional. People who know these rank higher, and I’ll tell you when they do.',
    optional: true,
  },
  { id: 'pitch', octo: 'Last one! What are you building?', optional: true },
];

export const ProfileSetupWizard: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { profile, saveProfile } = useAuth();
  const { refresh: refreshProgress, holdCelebrations } = useProgress();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<Answers>({ looking_for: [], languages: [], interests: [], seeking_skills: [], pitch: '' });
  const [finish, setFinish] = useState<null | { complete: boolean; xp: number }>(null);

  // Start from the current profile each time the wizard opens.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setDirection(1);
    setFinish(null);
    setAnswers({
      looking_for: profile?.looking_for ?? [],
      languages: profile?.languages ?? [],
      interests: profile?.interests ?? [],
      seeking_skills: profile?.seeking_skills ?? [],
      pitch: profile?.pitch ?? '',
    });
    // Only when opening: profile updates while the wizard is open must not wipe answers.
  }, [open]);

  // Hold level-up/achievement celebrations until the wizard's own finish screen is done.
  useEffect(() => {
    if (!open) return;
    return holdCelebrations();
  }, [open, holdCelebrations]);

  useDialog(panelRef, open && !finish, { onEscape: saving ? undefined : onClose });

  const current = STEPS[step];
  const canContinue = useMemo(() => {
    switch (current.id) {
      case 'intents':
        return answers.looking_for.length > 0;
      case 'languages':
        return answers.languages.length > 0;
      case 'interests':
        return answers.interests.length > 0;
      default:
        return true;
    }
  }, [current.id, answers]);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => setAnswers((a) => ({ ...a, [key]: value }));

  const go = (delta: number) => {
    setDirection(delta);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + delta)));
  };

  const save = async () => {
    setSaving(true);
    const wasComplete = profileChecks(profile).every((c) => c.done);
    try {
      const saved = await saveProfile({
        looking_for: answers.looking_for,
        languages: answers.languages,
        interests: answers.interests,
        seeking_skills: answers.seeking_skills,
        pitch: answers.pitch,
      });
      refreshProgress();
      const complete = profileChecks(saved).every((c) => c.done);
      setFinish({ complete, xp: complete && !wasComplete ? 50 : 0 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (!canContinue || saving) return;
    if (step === STEPS.length - 1) void save();
    else go(1);
  };

  const skip = () => {
    if (current.id === 'skills') set('seeking_skills', []);
    if (step === STEPS.length - 1) void save();
    else go(1);
  };

  const missingAfter = finish && !finish.complete ? profileChecks({ ...profile, ...answers }).filter((c) => !c.done) : [];

  if (typeof document === 'undefined') return null;

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && !finish && (
            <motion.div
              key="setup"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Set up your profile"
              tabIndex={-1}
              className="fixed inset-0 z-[65] flex flex-col bg-bg outline-none"
              initial={{ opacity: 0, y: reduced ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : 24 }}
              transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
            >
              {/* Top bar: back arrow / close + progress */}
              <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-4 sm:px-6">
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
                    aria-label="Close setup"
                  >
                    <X className="h-6 w-6" strokeWidth={3} aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
                    aria-label="Previous question"
                  >
                    <ArrowLeft className="h-6 w-6" strokeWidth={3} aria-hidden />
                  </button>
                )}
                <ProgressBar
                  value={(step + 1) / STEPS.length}
                  label="Setup progress"
                  valueText={`Question ${step + 1} of ${STEPS.length}`}
                  animateOnMount={false}
                />
                {step > 0 && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
                    aria-label="Close setup"
                  >
                    <X className="h-5 w-5" strokeWidth={3} aria-hidden />
                  </button>
                )}
              </div>

              {/* Question */}
              <div className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 sm:px-6">
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                      key={current.id}
                      custom={direction}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40 * direction }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40 * direction }}
                      transition={{ duration: 0.22, ease: EASE_OUT_CUBIC }}
                    >
                      <MascotBubble text={current.octo} size={72} className="mb-2" />
                      <h2 className="sr-only">{current.octo}</h2>
                      {current.hint && <p className="mb-5 mt-1 text-body text-ink-muted">{current.hint}</p>}

                      {current.id === 'intents' && (
                        <div role="group" aria-label="What brings you here" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {INTENTS.map((intent) => {
                            const on = answers.looking_for.includes(intent);
                            return (
                              <OptionCard
                                key={intent}
                                title={INTENT_LABELS[intent]}
                                subtitle={INTENT_BLURBS[intent]}
                                illustration={INTENT_ART[intent]}
                                selected={on}
                                onSelect={() =>
                                  set('looking_for', on ? answers.looking_for.filter((v) => v !== intent) : [...answers.looking_for, intent])
                                }
                              />
                            );
                          })}
                        </div>
                      )}

                      {current.id === 'languages' && (
                        <ChipSelect
                          options={LANGUAGE_OPTIONS}
                          value={answers.languages}
                          onChange={(v) => set('languages', v)}
                          allowCustom
                          customPlaceholder="Add another language"
                          ariaLabel="Languages you work in"
                        />
                      )}

                      {current.id === 'interests' && (
                        <ChipSelect
                          options={INTEREST_OPTIONS}
                          value={answers.interests}
                          onChange={(v) => set('interests', v)}
                          allowCustom
                          customPlaceholder="Add another interest"
                          ariaLabel="Your interests"
                        />
                      )}

                      {current.id === 'skills' && (
                        <ChipSelect
                          options={LANGUAGE_OPTIONS}
                          value={answers.seeking_skills}
                          onChange={(v) => set('seeking_skills', v)}
                          allowCustom
                          customPlaceholder="Add a skill (e.g. Figma, Kubernetes)"
                          ariaLabel="Skills you want in a collaborator"
                        />
                      )}

                      {current.id === 'pitch' && (
                        <div className="mt-5">
                          <label htmlFor="setup-pitch" className="type-caption text-ink-muted">
                            Your pitch
                          </label>
                          <textarea
                            id="setup-pitch"
                            value={answers.pitch}
                            onChange={(e) => set('pitch', e.target.value.slice(0, PITCH_MAX))}
                            rows={5}
                            maxLength={PITCH_MAX}
                            placeholder="e.g. An offline-first habit tracker in Flutter — looking for a backend dev to own sync."
                            className="field mt-2 resize-none text-[18px]"
                          />
                          <div className="mt-2 flex justify-end">
                            <span className={`text-body-sm ${answers.pitch.length >= PITCH_MAX ? 'text-gold-fg' : 'text-ink-muted'}`}>
                              {answers.pitch.length}/{PITCH_MAX}
                            </span>
                          </div>
                          <div className="mt-4 rounded-lg border-2 border-sky bg-sky-tint p-4 text-body-sm text-ink">
                            <strong className="font-extrabold text-sky-fg">Octo’s tip:</strong> say what you’re building and who you
                            need. “A CLI for X — looking for a Rust dev to own the parser” beats “cool project”.
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-border bg-bg">
                <div className="mx-auto flex w-full max-w-2xl flex-col-reverse gap-3 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  {current.optional ? (
                    <PressableButton variant="ghost" onClick={skip} disabled={saving}>
                      Skip
                    </PressableButton>
                  ) : (
                    <span className="hidden text-body-sm text-ink-muted sm:block">
                      {canContinue ? 'Nice picks!' : 'Pick at least one to continue.'}
                    </span>
                  )}
                  <PressableButton onClick={next} disabled={!canContinue} loading={saving} className="sm:min-w-[200px]">
                    {step === STEPS.length - 1 ? 'Finish' : 'Continue'}
                  </PressableButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Celebration
        open={!!finish}
        onClose={() => {
          setFinish(null);
          onClose();
        }}
        illustration={finish?.complete ? 'hundred_points' : 'party_popper'}
        title={finish?.complete ? 'You’re all set!' : 'Nice work!'}
        message={
          finish?.complete ? (
            'Your profile is complete. Let’s find your people.'
          ) : (
            <>
              Your profile is ready for matching.
              {missingAfter.length > 0 && (
                <>
                  {' '}
                  To reach 100% and earn +50 XP, add {missingAfter.map((c) => c.label.toLowerCase()).join(', ')} in Settings.
                </>
              )}
            </>
          )
        }
        xp={finish?.xp || undefined}
        primaryLabel="Start discovering"
        onPrimary={() => {
          setFinish(null);
          onClose();
          navigate('/app/discover');
        }}
      />
    </>
  );
};
