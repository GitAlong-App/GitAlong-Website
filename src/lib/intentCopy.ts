import type { Intent } from './collab';

/** One-line UI blurbs for the collaboration intents (labels live in collab.ts). */
export const INTENT_BLURBS: Record<Intent, string> = {
  cofounder: 'Start a company together',
  side_project: 'Build something for the fun of it',
  open_source: 'Contribute, or find contributors',
  hackathon: 'Team up for a weekend sprint',
  mentor: 'Help someone grow',
  mentee: 'Learn from someone further along',
};
