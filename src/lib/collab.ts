/**
 * Shared collaboration vocabulary.
 *
 * Keep in sync with docs/API_AND_DATA_CONTRACT.md (§1) in the main GitAlong
 * repo, the `users_looking_for_valid` CHECK constraint, the backend
 * (backend/app/services/collab.py) and the Flutter constants.
 */

export const INTENTS = [
  'cofounder',
  'side_project',
  'open_source',
  'hackathon',
  'mentor',
  'mentee',
] as const;

export type Intent = (typeof INTENTS)[number];

/** UI labels, exactly as in the contract table. */
export const INTENT_LABELS: Record<Intent, string> = {
  cofounder: 'Co-founder',
  side_project: 'Side-project partner',
  open_source: 'Open-source collaborators',
  hackathon: 'Hackathon teammates',
  mentor: 'I want to mentor',
  mentee: "I'm looking for a mentor",
};

/** Which intent on the other side pairs well with each intent. */
export const INTENT_MATCHES_WITH: Record<Intent, Intent> = {
  cofounder: 'cofounder',
  side_project: 'side_project',
  open_source: 'open_source',
  hackathon: 'hackathon',
  mentor: 'mentee',
  mentee: 'mentor',
};

/** Short phrase used in sentences ("looking for a co-founder"). */
export const INTENT_PHRASES: Record<Intent, string> = {
  cofounder: 'a co-founder',
  side_project: 'a side-project partner',
  open_source: 'open-source collaborators',
  hackathon: 'hackathon teammates',
  mentor: 'someone to mentor',
  mentee: 'a mentor',
};

export const isIntent = (value: string): value is Intent =>
  (INTENTS as readonly string[]).includes(value);

export const intentLabel = (value: string): string =>
  isIntent(value) ? INTENT_LABELS[value] : value;

export const LANGUAGE_OPTIONS = [
  'Dart',
  'Python',
  'JavaScript',
  'TypeScript',
  'Rust',
  'Go',
  'Java',
  'Kotlin',
  'Swift',
  'C++',
  'C#',
  'Ruby',
  'PHP',
  'Scala',
  'Elixir',
  'Haskell',
  'Lua',
  'R',
  'Shell',
  'SQL',
] as const;

export const INTEREST_OPTIONS = [
  'Open Source',
  'AI / ML',
  'Web Dev',
  'Mobile Dev',
  'Backend',
  'DevOps',
  'Data Science',
  'Game Dev',
  'Security',
  'Cloud',
  'Blockchain',
  'IoT',
  'UI / UX',
  'Embedded Systems',
  'AR / VR',
] as const;

export const REPORT_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'fake_profile',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  inappropriate: 'Inappropriate content',
  fake_profile: 'Fake profile',
  other: 'Something else',
};

export const PITCH_MAX = 280;
export const MESSAGE_MAX = 4000;
export const REPORT_DETAILS_MAX = 1000;

/** Human labels for the backend `score_breakdown` keys. */
export const SCORE_BREAKDOWN_LABELS: Record<string, string> = {
  intent_fit: 'Intent fit',
  skill_complement: 'Skills you want',
  tech_match: 'Shared tech',
  interest_match: 'Shared interests',
  activity_level: 'GitHub activity',
  community_popularity: 'Community reach',
  recency_boost: 'Recently active',
  location_bonus: 'Location',
};

export interface CollabProfileFields {
  looking_for?: string[] | null;
  languages?: string[] | null;
  interests?: string[] | null;
}

/** What is still missing before the profile can be matched well (mirrors the mobile setup gate). */
export function missingProfileFields(profile: CollabProfileFields | null | undefined): string[] {
  if (!profile) return [];
  const missing: string[] = [];
  if (!profile.looking_for?.length) missing.push('what you are looking for');
  if (!profile.languages?.length) missing.push('your languages');
  if (!profile.interests?.length) missing.push('your interests');
  return missing;
}

export const isProfileComplete = (profile: CollabProfileFields | null | undefined): boolean =>
  !!profile && missingProfileFields(profile).length === 0;

interface IcebreakerProfile {
  name?: string | null;
  username?: string | null;
  languages?: string[] | null;
  interests?: string[] | null;
  github_topics?: string[] | null;
  looking_for?: string[] | null;
  seeking_skills?: string[] | null;
  pitch?: string | null;
}

const lowerSet = (values: string[] | null | undefined) =>
  new Map((values ?? []).filter(Boolean).map((v) => [v.trim().toLowerCase(), v.trim()]));

/** 2–3 conversation starters for an empty thread, based on both profiles. */
export function buildIcebreakers(me: IcebreakerProfile | null, other: IcebreakerProfile): string[] {
  const suggestions: string[] = [];
  const myIntents = new Set((me?.looking_for ?? []).filter(isIntent));
  const theirIntents = (other.looking_for ?? []).filter(isIntent);

  const sharedIntent = theirIntents.find((i) => myIntents.has(INTENT_MATCHES_WITH[i]));
  if (sharedIntent === 'cofounder') {
    suggestions.push("Hey! We're both looking for a co-founder — what's the idea you keep coming back to?");
  } else if (sharedIntent === 'hackathon') {
    suggestions.push('Hi! Got a hackathon coming up? I’d be up for teaming.');
  } else if (sharedIntent === 'open_source') {
    suggestions.push('Hey! Which open-source project would you most like to contribute to right now?');
  } else if (sharedIntent === 'side_project') {
    suggestions.push('Hi! What kind of side project would you want to build together?');
  } else if (sharedIntent === 'mentor') {
    suggestions.push("Hi! I'd love some mentorship — what do you enjoy helping people with?");
  } else if (sharedIntent === 'mentee') {
    suggestions.push('Hi! Happy to mentor — what are you trying to get better at?');
  }

  if (other.pitch?.trim()) {
    suggestions.push('Your pitch caught my eye — where is the project at right now?');
  }

  const theirLangs = lowerSet(other.languages);
  const wanted = (me?.seeking_skills ?? []).find((s) => theirLangs.has(s.trim().toLowerCase()));
  if (wanted) {
    suggestions.push(`I'm looking for someone strong in ${theirLangs.get(wanted.trim().toLowerCase())} — what have you built with it?`);
  } else {
    const myLangs = lowerSet(me?.languages);
    const shared = [...theirLangs.keys()].find((k) => myLangs.has(k));
    if (shared) {
      suggestions.push(`Fellow ${theirLangs.get(shared)} dev! What are you working on with it lately?`);
    }
  }

  const myTopics = lowerSet([...(me?.interests ?? []), ...(me?.github_topics ?? [])]);
  const theirTopics = lowerSet([...(other.interests ?? []), ...(other.github_topics ?? [])]);
  const sharedTopic = [...theirTopics.keys()].find((k) => myTopics.has(k));
  if (sharedTopic) {
    suggestions.push(`Looks like we're both into ${theirTopics.get(sharedTopic)} — any project you'd recommend?`);
  }

  suggestions.push('Hey! Thanks for matching — what are you hoping to build next?');

  return Array.from(new Set(suggestions)).slice(0, 3);
}
