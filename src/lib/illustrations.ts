/**
 * Fluent Emoji 3D illustrations (Microsoft, MIT) shipped in public/illustrations/.
 * See THIRD_PARTY_NOTICES.md and public/illustrations/LICENSE-fluentui-emoji.txt.
 * Mapping of meaning → art: docs/DESIGN_SYSTEM.md §5.
 */

export const ILLUSTRATIONS = [
  'alarm_clock', 'artist_palette', 'bar_chart', 'bell', 'books', 'brain', 'busts', 'calendar',
  'chart_increasing', 'check_mark', 'clapping_hands', 'collision', 'compass', 'confetti_ball', 'cool_face',
  'crown', 'crystal_ball', 'dizzy', 'envelope', 'eyes', 'fire', 'first_place', 'flexed_biceps', 'gear',
  'gem_stone', 'ghost', 'globe', 'glowing_star', 'graduation_cap', 'hammer_and_wrench', 'handshake',
  'high_voltage', 'hourglass', 'hugging_face', 'hundred_points', 'key', 'keyboard', 'laptop', 'light_bulb',
  'link', 'locked', 'magnifying_glass', 'megaphone', 'memo', 'mobile_phone', 'monocle_face', 'nerd_face',
  'octopus', 'party_popper', 'partying_face', 'puzzle_piece', 'red_heart', 'robot', 'rocket', 'seedling',
  'shield', 'sleeping_face', 'snowflake', 'sparkles', 'sparkling_heart', 'speech_balloon', 'sports_medal',
  'star', 'star_struck', 'stopwatch', 'technologist', 'test_tube', 'thinking_face', 'trophy', 'victory_hand',
  'waving_hand', 'wrapped_gift',
] as const;

export type IllustrationName = (typeof ILLUSTRATIONS)[number];

/** Source images are 256×256 PNGs. */
export const ILLUSTRATION_SOURCE_SIZE = 256;

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

export const illustrationUrl = (name: IllustrationName): string => `${BASE}illustrations/${name}.png`;

/** Art for each collaboration intent (spec §5). */
export const INTENT_ART = {
  cofounder: 'rocket',
  side_project: 'hammer_and_wrench',
  open_source: 'globe',
  hackathon: 'high_voltage',
  mentor: 'graduation_cap',
  mentee: 'seedling',
} as const satisfies Record<string, IllustrationName>;

export const intentArt = (intent: string): IllustrationName =>
  (INTENT_ART as Record<string, IllustrationName>)[intent] ?? 'sparkles';
