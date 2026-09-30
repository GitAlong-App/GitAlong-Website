/**
 * Achievement definitions — must match docs/DESIGN_SYSTEM.md §6 exactly (the
 * same 10 keys the `get_my_progress` RPC returns and the mobile app shows).
 */
import type { IllustrationName } from './illustrations';

export const ACHIEVEMENT_KEYS = [
  'first_swipe',
  'explorer_50',
  'first_match',
  'matches_10',
  'icebreaker',
  'real_talk',
  'streak_3',
  'streak_7',
  'goal_crusher',
  'profile_complete',
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_KEYS)[number];

export interface AchievementDef {
  key: AchievementKey;
  art: IllustrationName;
  title: string;
  /** How to earn it, in plain words. */
  description: string;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { key: 'first_swipe', art: 'seedling', title: 'First steps', description: 'Review your first builder.' },
  { key: 'explorer_50', art: 'compass', title: 'Explorer', description: 'Review 50 builders.' },
  { key: 'first_match', art: 'handshake', title: "It's a match!", description: 'Get your first match.' },
  { key: 'matches_10', art: 'link', title: 'Connector', description: 'Get 10 matches.' },
  { key: 'icebreaker', art: 'speech_balloon', title: 'Icebreaker', description: 'Send the first message in a match.' },
  {
    key: 'real_talk',
    art: 'busts',
    title: 'Real talk',
    description: 'Have a real conversation: you both write, 6+ messages.',
  },
  { key: 'streak_3', art: 'fire', title: 'On fire', description: 'Reach a 3-day streak.' },
  { key: 'streak_7', art: 'high_voltage', title: 'Unstoppable', description: 'Reach a 7-day streak.' },
  { key: 'goal_crusher', art: 'trophy', title: 'Goal crusher', description: 'Hit your daily goal on 5 days.' },
  { key: 'profile_complete', art: 'hundred_points', title: 'All set', description: 'Complete your profile.' },
];

const BY_KEY = new Map<string, AchievementDef>(ACHIEVEMENTS.map((a) => [a.key, a]));

export const isAchievementKey = (value: string): value is AchievementKey => BY_KEY.has(value);

export const achievementByKey = (key: string): AchievementDef | undefined => BY_KEY.get(key);
