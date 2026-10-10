# DisasterReady

An educational prototype with disaster-preparedness modules, drills, quizzes, canvas/3D games, and optional rule-based chat. It is **not an emergency response service**. Learning content needs subject-matter review before public safety use.

This is the maintained local copy. At the start of this refactor its origin was `https://github.com/Megha737/DisasterReady.git`, baseline commit `bc3a828`. No remote was changed or deployment made. The removed `MeghaRep` copy was not merged during this work.

## Setup

Use Node.js 24 and Python 3.11+ (verified here with Node 26 and Python 3.14). Existing directory names are retained to avoid deployment-path churn.

Frontend, from this directory:

```bash
npm run install:frontend
npm run dev:frontend
```

Backend, in a second terminal:

```bash
cd disasterready-backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m uvicorn app.main:app --reload
```

On Windows use `.venv\Scripts\python.exe` in place of `.venv/bin/python`. Frontend runs on port 3000; backend runs on 8000. Production frontend: `npm --prefix sih_fron run build`, then `npm --prefix sih_fron start`. Run the backend without `--reload` behind a managed process and HTTPS proxy.

## Configuration

Examples: [frontend](sih_fron/.env.example), [backend](disasterready-backend/.env.example). Never commit real environment files.

- `NEXT_PUBLIC_API_BASE_URL`: optional browser-visible FastAPI origin. Leave unset for labeled demo chat. Set to `http://localhost:8000` in `sih_fron/.env.local` to connect locally; restart Next after changing it.
- `DATABASE_URL`: backend process environment, default `sqlite:///./disaster.db`. Relative paths are resolved from the backend working directory.
- `CORS_ORIGINS`: comma-separated backend process environment; defaults to localhost/127.0.0.1 port 3000. Explicit origins, no credentialed wildcard.

The backend does not automatically load a dotenv file: export these settings or configure the deployment environment. Startup creates missing tables; it does not migrate an existing schema. Back up the SQLite file before schema changes. No live database is touched by the test suite.

## Architecture and status

| Boundary | Responsibility |
| --- | --- |
| `sih_fron/src/app` | Next routes, composition, existing page UI |
| `src/features/games/shake-survive` | Controller, geometry/physics/models, renderer, validated local scores, presentation styles |
| `src/features/games/blaze-escape` | Mutable simulation world, fixed-step controller, renderer, optional audio adapter, authored levels |
| `src/features/games/fire-escape` | Authored scenarios, tested choice transitions, decorative 3D environment |
| `src/features/games/{spot-finder,quiz}` | Typed room/question data and game-specific rules |
| `src/features/modules` | Authored lessons, pure learning transitions and separate 3D decoration |
| `src/features/drills` | Authored scenarios, tested deadline/scoring rules, concrete controller/audio adapter and scenes |
| `src/features/navigation` | Shared primary navigation, mobile menu and theme controls |
| `src/features/learning` | Optional decorative-canvas boundary, reduced-motion preference and bounded image/cloud fallback |
| `src/features/{home,help}` | Honest feature/FAQ content, official-resource metadata and separate scenes |
| `src/features/games/menu` | Five game destinations, focused card interaction and decorative menu scene |
| `src/features/chat` | Study conversation controller, draft/cancellation behavior and decorative character |
| `src/features/accounts` | Versioned local demo records, reactive account views, forms/profile draft, bounded avatars, stored statistics and decorative scenes; not secure authentication |
| `src/features/theme/useDarkMode.ts` | One persisted theme preference across routes; safe with disabled storage |
| `src/lib/decoration.ts` | Stable decorative positions instead of render-time randomness |
| `src/lib/api.ts` | Optional chat transport, timeout and response validation |
| `disasterready-backend/app/main.py` | App factory, lifespan, CORS, route registration |
| `app/{database,models,schemas}.py` | SQLite sessions/tables and request/response validation |
| `app/services/chat.py` | Existing keyword-based educational replies |

API:

| Method/path | Contract |
| --- | --- |
| `GET /` | Health: `{"status":"ok"}` |
| `POST /chat` | Nonblank `message`, 1–4000 characters; persists a chat row and returns `user_message` / `bot_response` |
| `GET /quiz/flood` | Existing placeholder response only, not a question-bank API |
| `GET /docs` | Generated FastAPI contract |

Frontend quizzes use local question data; they do not call the placeholder quiz endpoint. Chat sends messages only when its API origin is explicitly configured. It is keyword-based, not generative AI.

## Checks

```bash
npm run check:frontend
npm run test:backend
```

Frontend checks include zero-warning ESLint, TypeScript, domain/transport tests, and production compilation. Backend tests use isolated in-memory SQLite: persistence, invalid payloads, health/quiz endpoints, routing, and response rules.

For production browser tests, run these commands in `sih_fron`:

```bash
npx playwright install chromium
npm run test:e2e
DISASTER_TEST_CONNECTED_CHAT=1 npm run test:e2e
```

The default suite builds the app, starts it on `127.0.0.1:4181`, and tests real browser interactions. The last command performs a separate configured-chat production build with a fixed local mock endpoint, selecting its connected-mode journeys. The environment assignment shown is POSIX syntax; use a per-command environment variable on other shells. External requests are blocked; the decorative cloud texture and successful audio loading are mocked. No live backend or real account is needed. Retained failure traces/screenshots go into ignored `test-results/`. In a multi-project workspace, `PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium` avoids pruning browser versions used by other projects.

Coverage includes scenario win/loss/reset, Spot Finder keyboard/pointer scoring and progression, Blaze wall collision and offline start, Shake timing and malformed score storage, prototype-account redirects, Blaze animation/audio cleanup on client-side navigation, and persisted/storage-disabled themes. The domain suite covers the underlying rules without React, graphics, audio, or HTTP servers. The temporary warning-level compiler overrides and build-time type-error bypasses have been removed.

Learning coverage also exercises every module/drill, the full standalone quiz, back/skip/reset, incorrect-answer feedback, answer locking, deadline expiry, audio mute/unmount, unavailable WebGL, reduced-motion fallback and narrow-screen touch controls. [Learning behavior and module ownership](docs/learning.md) documents the intentional fixes and remaining acceptance work. Lesson/drill/quiz results last only for the current page visit and do not update account statistics.

Account coverage exercises explicit signup, both login routes, logout, profile cancel/save/reload, username collisions, supported/rejected avatars, failed or blocked storage, native cross-tab updates, stale edits, truthful rankings and mobile/normal-motion views. [Demo accounts and profiles](docs/accounts.md) explains the single-key storage contract, legacy compatibility, image limits, recovery precautions and code ownership. No account is automatically seeded; migration happens only with an explicit successful mutation and retains the old keys.

Public-page coverage checks truthful feature links, India-scoped official emergency resources without placing calls, FAQ keyboard use, mobile navigation/themes, reduced-motion/WebGL fallbacks, failed textures, Fire Escape choices without WebGL, and both chat modes. Connected chat checks validated replies, retained drafts, failures, request locking, cancellation, timeout and navigation cleanup. [Public pages, chat and assets](docs/public-pages.md) documents these contracts and the reviewed asset inventory.

The default browser build leaves `NEXT_PUBLIC_API_BASE_URL` empty; the connected-chat build uses a test-only local URL. Rebuild with the intended configuration before deploying; do not treat either test output as a release artifact.

### Game implementation notes

- Blaze's simulation advances at a fixed 60 Hz; the controller copies player snapshots into React instead of mutating React state. CSS-scaled pointer coordinates map back to canvas coordinates. Audio is optional, times out after eight seconds if unavailable, and all owned sound nodes and animation callbacks are cleaned up on exit.
- Fire Escape applies consequences, feedback, outcome, and the next scenario in one transition. Initial choices use a stable order for hydration; later choices shuffle in the user event, not while rendering.
- Spot Finder preserves authored coordinates and safety labels. Only presentation order shuffles between rooms. The room keeps its 3D tilt but no longer floats underneath interactive targets; pointer and keyboard choices use the same scoring path.
- Shake's renderer is separate from simulation updates. Stored scores are validated before rendering, storage failures are visible, and typing in the name field no longer triggers game controls.
- Explicit decorative positions are deterministic across rendering; upstream cloud/star effects retain their own behavior. The homepage now uses installed-library icons instead of remote Flaticon images. Local images and avatar previews use explicit dimensions without routing requests through Next's image optimizer; asset availability and licensing still need review.
- Modules/drills/quiz now keep authored content and pure session rules separate from their screens and decoration. Drill completion requires every correct choice before the monotonic deadline; expiry cannot become a successful finish. Skip Quiz exits without completion. UI completion claims describe practice, not proven safety expertise.
- The drill audio adapter owns all loops/effects and cleans up on mute, end, navigation and unmount. Its referenced local MP3 files are currently missing; playback failure is visible and never blocks practice. See [audio and decoration limits](docs/learning.md#audio-and-decoration).

Manual acceptance: visit modules/drills; start, win/lose, restart and leave each game; test keyboard/touch controls, browser audio permission and unmount cleanup; try malformed local storage; connect/disconnect chat; test both themes and narrow screens. Unit tests do not validate the entire canvas gameplay lifecycle.

## Deployment gates and limitations

- Accounts/passwords and scores are local demonstrations. They provide **no secure login, teacher authorization, or cross-device persistence**. Never enter a real password or private profile details. Missing statistics display as missing, real zero values remain zero, and only stored badges are shown. Accounts without recorded quiz attempts/scores stay unranked. Storage failures are visible; a single-write envelope and stale-profile check reduce partial-save bugs but do not guarantee simultaneous cross-tab transactions. Production auth requires a separate implementation.
- Chat has no authentication, rate limit, retention controls, or abuse protection. Do not expose the backend publicly before those are designed; configured chat stores submitted text.
- Optional Tone.js audio loads from an external CDN; some Three/Drei assets and Google fonts need network access. A failed audio request does not prevent Blaze from starting. Assets in `public` retain their existing names; licenses and original ownership need confirmation before publication.
- Game simulation loops remain game-specific. There is intentionally no shared generic engine. Public sample metrics, unavailable alert/support promises and automatic badge claims have been corrected; the asset inventory is documented, not license-cleared. Broader touch/audio/WebGL acceptance and independent instructional review remain open.
- Dependency audit findings must be triaged before deployment. Do not blindly use `npm audit fix --force`.
- Supplied instructional claims have been preserved, not independently safety-certified.

The frontend now pins Next.js and its lint configuration to 16.4.0. Compatible audit fixes cleared the production-only npm findings at the October 10 checkpoint; lint-tool dependency findings remain. The Python backend's unused npm manifests, the unused Axios adapter, and the unused frontend JWT dependency were removed. Root npm commands now only orchestrate the two applications.

The local-check workflow is defined in `.github/workflows/check.yml`; it has not yet been exercised by hosted CI.
