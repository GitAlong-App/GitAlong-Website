# GitAlong website

The web app and marketing site for **GitAlong** — *find the developer your project is missing.*

People say why they're here (co-founder, side-project partner, open-source collaborators, hackathon teammates, mentoring or looking for a mentor), what they're building (a ≤280-character pitch) and which skills they want in a partner. GitAlong recommends collaborators with compatible intent and complementary skills, shows their real GitHub work, and explains each match ("You're both looking for a co-founder", "Knows TypeScript — a skill you want").

Live at <https://gitalong.vercel.app>.

## What's in here

| Area | Routes | Notes |
|---|---|---|
| Marketing pages | `/`, `/features`, `/faq`, `/about`, `/team`, `/maintainer`, `/contact`, `/privacy` | Public. Contact form uses Formspree. |
| App (signed in) | `/app/discover`, `/app/messages`, `/app/messages/:matchId`, `/app/activity`, `/app/profile`, `/app/settings` | Protected by GitHub sign-in (Supabase Auth). `/profile` redirects to `/app/profile`. |

App features:

- **Discover** — ranked recommendations from the backend with pitch, "looking for" chips, up to three match reasons and a score breakdown; filter by intent (`looking_for`), languages, interests and more. Falls back to trending GitHub repositories when the backend is unavailable or has no candidates.
- **Messages** — real-time chat with matches (Supabase Realtime), unread badges, icebreakers for new matches, and unmatch / block / report.
- **Activity** — matches, liked developers, recent swipes and saved repositories.
- **Profile** — profile strength ring (the 8 checks from the design system), level, streak/XP/match/star tiles, a "complete your profile" checklist, achievements and top repositories.
- **Settings** — GitAlong profile editor (name, bio, location, company, website, intents, languages, interests, skills wanted, pitch), data export, real account deletion, and per-browser preferences (theme, sounds).
- **Guided setup** — a one-question-per-step wizard offered while intents, languages or interests are missing.
- **Progress** — streak, daily goal, XP, level and achievements from the `get_my_progress` RPC (shared with the mobile app). If the RPC fails, the progress UI hides itself; nothing else depends on it.

## Design system

The look ("Play": bright, tactile, celebratory) follows **`docs/DESIGN_SYSTEM.md`** in the main repo. Tokens live in `tailwind.config.js` (colours with light/dark CSS variables in `src/index.css`, radii, type scale, `shadow-edge-*` 3D edges). The component kit is in `src/components/ui/` and uses the same names as the Flutter app: `PressableButton`, `Tile`, `OptionCard`, `Chip`, `ProgressBar`, `ProgressRing`, `StreakChip`, `XpChip`, `LevelBadge`, `AchievementTile`, `MascotBubble`, `Celebration` (canvas confetti), `EmptyState`, `Skeleton`, `Toast`/`AchievementToast`, `SegmentedTabs`, `CircleActionButton`. Achievement definitions are in `src/lib/achievements.ts`.

Illustrations are Microsoft Fluent Emoji 3D (MIT) in `public/illustrations/`; the mascot is Octo (`octopus.png`). The favicons, app icons and `og-image.jpg` in `public/` are generated from `octopus.png`. Fonts: Nunito and JetBrains Mono from Google Fonts (SIL OFL). Dark mode follows the OS setting, with a toggle remembered in this browser.

## How it fits with the rest of GitAlong

GitAlong has three clients of one Supabase project:

- **This website** (React).
- **The Flutter mobile app** and **the FastAPI backend** — both in the main repo, <https://github.com/GitAlong-App/gitalong>.

The contract between them lives in the main repo at **`docs/API_AND_DATA_CONTRACT.md`** (database objects, RLS rules, RPCs and REST endpoints). In short:

- Core loops go straight to Supabase through RLS-protected tables and RPCs, so they work when the backend is cold: profile (`ensure_user_profile` RPC, update own `users` row), other people (`public_profiles` view — never email), swipes, matches, messages, blocks (`block_user`), reports, `mark_match_read`, `get_likes_received_count`.
- Ranking and GitHub sync go through the backend (`GET /api/v1/recommendations`, `POST /api/v1/users/me/refresh-github`). Account deletion uses `DELETE /api/v1/users/me` with the `delete_my_account` RPC as fallback.
- Backend calls send `Authorization: Bearer <Supabase access token>`, read from the live session right before each request (`getAccessToken()` in `src/lib/supabase.ts`). Tokens are never copied into localStorage.

Shared vocabulary (intent keys and labels, language/interest options, report reasons, `PITCH_MAX`) is in `src/lib/collab.ts` and must stay in sync with the contract.

## Setup

Requirements: Node 18+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon key (public; RLS protects the data). |
| `VITE_BACKEND_URL` | yes | Backend origin without `/api/v1`, e.g. `https://gitalong-backend.onrender.com`. Defaults to `http://localhost:8000`. |
| `VITE_APP_URL` | no | Public URL of the site, used for canonical/OG links. Defaults to `https://gitalong.vercel.app`. |

Everything prefixed `VITE_` ends up in the browser bundle — never put secrets (service-role keys, GitHub tokens) in these variables. The build works without a `.env`; sign-in and the app just won't function until Supabase is configured.

### GitHub sign-in

Sign-in uses Supabase Auth's GitHub provider (scopes `read:user user:email`). In the Supabase dashboard enable the GitHub provider with your GitHub OAuth app's client ID/secret, set the GitHub OAuth app's callback URL to `https://<project>.supabase.co/auth/v1/callback`, and add your site URLs (e.g. `http://localhost:3000`, `https://gitalong.vercel.app`) to Auth → URL configuration.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 3000. |
| `npm run type-check` | Type-checks the app (`tsconfig.app.json`) and the Vite config (`tsconfig.node.json`). |
| `npm run build` | Type-check, then production build into `dist/`. |
| `npm run preview` | Serve the production build locally. |

## Project structure

```
src/
  components/        landing sections, app shell, discover/, marketing/, ProfileEditor, ProfileSetupWizard, …
  components/ui/     the Play component kit (see Design system)
  contexts/          AuthContext (session + profile), MatchesContext (matches, unread, realtime),
                     ProgressContext (get_my_progress + celebrations), ProfileSetupContext, ThemeContext
  lib/               supabase client + getAccessToken, collab vocabulary, row types, progress + achievements,
                     illustrations, storage helpers, formatting, links
  pages/             route components
  routes/            ProtectedRoute / PublicRoute
  services/          backendService (FastAPI), dataService (Supabase tables/RPCs), githubService (public GitHub API)
public/              static assets, manifest, robots.txt, sitemap.xml
```

## Deployment (Vercel)

The site is a static Vite build deployed on Vercel (`vercel.json` sets the build command, SPA rewrites and security headers).

1. Import the repository in Vercel (framework preset: Vite).
2. Add the environment variables above for Production (and Preview if needed).
3. Deploy — every push to `main` redeploys.

The backend is deployed separately on Render from the main repo.

## Mobile app

The Android beta is distributed as an APK on [GitHub Releases](https://github.com/GitAlong-App/gitalong/releases); it is not in Google Play yet. iOS is coming later.
