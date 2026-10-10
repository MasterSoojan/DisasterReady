# Public pages, chat and assets

The homepage, Help, arcade menu and Study Buddy explain and open the educational
prototype. They must not imply emergency dispatch, verified training outcomes,
live advisers, location-based alerts or secure accounts that the app does not have.

## Where to make changes

Paths are relative to `sih_fron/src/`.

| Area | Responsibility |
| --- | --- |
| `features/navigation/SiteHeader.tsx` | Shared primary navigation, mobile menu, current-page and theme controls |
| `features/home/content.ts` | Shipped feature descriptions, existing-library icons and destination links |
| `features/help/content.ts` | FAQ text/links and region-scoped official emergency-resource metadata |
| `features/games/menu/{data,GameCard,Scene}` | Existing five destinations, card interaction and menu decoration |
| `features/{home,help,chat}/Scene.tsx` | Existing scene geometry kept separate from page controls and requests |
| `features/chat/useStudyChat.ts` | Conversation draft, in-flight lock, feedback, cancellation and unmount ownership |
| `features/learning/{textureSource,OptionalCloud}` | Bounded optional image decoding and the existing cloud effect with a safe inline texture |
| `lib/api.ts` | Concrete optional chat request, input/configuration/response checks and timeout |
| `app/{page,help/page,games/page,chat/page}.tsx` | Route presentation and composition |

Navigation is shared with lessons, drills and account views; game-specific play
controls remain local. Decorative scenes reuse the existing capability/error
boundary in `features/learning/DecorativeCanvas.tsx`. Reduced motion omits those
canvases; arcade cards also disable pointer tilt/hover scaling. A missing WebGL
context must not prevent access to text, links or the chat form.
The installed Three renderer reports even caught loader errors to the browser.
Expected image failures are therefore handled before its Suspense loader runs:
an eight-second, cancelable image-decoding step makes a temporary inline PNG copy
of valid artwork (up to 4096 × 4096 pixels). Missing, blocked, oversized or
undecodable artwork is omitted; the other scene elements and page controls remain.
Unmount/timeout detaches handlers, releases the image source and discards temporary
canvas buffers. This does not suppress unexpected application errors globally.
Fire Escape now uses the same optional boundary for its decorative environment;
its authored choices and scoring still run without WebGL. The 2D canvases that
actually render Blaze/Shake gameplay are not replaced by this decorative fallback.

## Public copy and navigation

The homepage no longer publishes sample student/school counts or improvement
percentages. Feature cards describe implemented routes and are real links, not
nonfunctional pointer-styled panels. Claims about localized alerts, measurable
panic reduction and curriculum adoption were removed; no substitute impact
statistics were invented. The colorful themes and existing weather geometry remain.

The arcade keeps all five original game destinations. Difficulty remains a game
label; the page no longer promises account badges. Standalone quiz progress and
most learning results are temporary; Shake's separate local score list is not the
account leaderboard. See the [learning](learning.md) and [account](accounts.md)
guides for those distinct contracts.

Help uses native keyboard-accessible FAQ disclosure controls. Answers describe the
current quiz, demo ranking, avatar and chat behavior. The former `/feedback` link
had no route, and the claim that a support team was standing by was unsupported;
both were removed. No contact form or fake message delivery was added. Back Home
links work when a page is opened directly without prior history.

### Emergency information is region-specific

Help explicitly identifies India and links to the Ministry of Home Affairs'
[Emergency Response Support System information](https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss).
That official source describes 112 as India's unified emergency number covering
police, health and fire services. It was checked on October 10, 2026; that is the
review date, not a claim about the page's publication date.

The old unlabeled 108/100/101 cards are replaced by a clearly labeled `tel:112`
link for India and an official-source link. Outside India, the page tells visitors
to use the official number for their location. It does not guess location, promise
response availability or certify a successful call. The call link only hands off
to the device's phone handler; DisasterReady is not connected to ERSS.

Browser tests check link targets without activating a telephone link or contacting
an emergency service. No real call or dispatch was performed.

## Study Buddy behavior

With no `NEXT_PUBLIC_API_BASE_URL`, chat shows an explicit local demo reply and makes
no chat request. With a configured backend, each send issues one `POST /chat` with
`{ "message": "..." }`. The backend remains the existing keyword-based service,
not generative AI or a staffed support channel.

- Messages are trimmed and limited to 1–4000 characters. The endpoint must be
  HTTP(S) without embedded credentials, query parameters or a fragment.
- One controller owns a pending request. Repeat sends are locked and the draft is
  read-only while waiting. A successful checked reply appends the user/reply pair
  and clears the draft; failed requests retain it and show a separate error.
- Replies must echo the submitted message and contain nonblank reply text of at
  most 8,000 characters. Invalid JSON, wrong-message responses and provider errors
  never become successful assistant messages. Text renders as text, not HTML.
- The ten-second deadline covers fetch/body reading and is cleared on completion.
  Cancel waiting or leaving the route aborts waiting and ignores late results.
  There is no automatic retry.
- Cancel, timeout or a network failure **does not roll back a server write**. The
  configured backend may already have stored the message. Re-sending can create
  another database row; this protocol has no idempotency or delivery reconciliation.
- Conversation display lasts only for the mounted page. It is not saved to local
  storage or restored from the backend. Resetting the screen does not erase backend
  chat rows. The transcript scrolls inside its panel, not the entire document.

Connected-mode copy warns before sending that the backend persists submitted text.
Do not use private messages in this prototype. Authentication, rate limits, abuse
controls and retention/erasure are still required before public backend deployment.
Authored reply content is unchanged and still needs independent safety review.

## Asset inventory and release checks

Inventory checked against the source and `public/` on October 10, 2026. No asset
license or ownership was inferred from a filename or the fact it was in the repo.

| Asset/dependency | Current use and remaining action |
| --- | --- |
| `public/logo.jpg` | Shared navigation; 1024 × 1024 JPEG. Original author/license is not recorded here; confirm before publishing. |
| `public/robot-girl.png` | Chat header and decorative sprite; 408 × 612 PNG. Original author/license still needs confirmation. |
| `image.png`, `image1.png`, `image2.png`, `image3.png`, `imagee.png`, `ima1.jpg`, `ima2.jpg`, `l.png` | No current source references found. Retained, not deleted; provenance/need remains to be decided. `l.png` actually contains JPEG data. |
| `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` | Unreferenced starter assets retained. Do not treat them as DisasterReady branding. |
| `sounds/{siren,rumble,water,correct,wrong,win}.mp3` | Referenced but absent. Audio failure is visible and practice continues; add reviewed/licensed files only if sound is wanted. |
| Drei cloud texture | `OptionalCloud` loads the same versioned upstream `rawcdn.githack.com/pmndrs/drei-assets/...` texture, then passes a decoded inline copy to the existing effect. Failed loads omit clouds. Test success paths mock it; distribution rights and real network availability are not established here. |
| Google fonts | Geist is fetched during Next builds; Spot/Shake import Rajdhani/Inter CSS at runtime. Recheck network/fallback behavior before deployment. |
| Tone.js 14.7.77 from cdnjs | Optional Blaze audio script. Existing load timeout/failure handling remains; no new CDN dependency was added. |
| React Icons and procedural Three geometry | Reuse existing installed icon libraries and shapes. Keep applicable upstream notices and review existing artwork/symbols before release. |

The homepage's sixteen Flaticon image references were replaced with icons already
in the codebase's installed library; the homepage no longer requires that image
host. Existing raster files, drill sound paths and authored gameplay content were
not changed. This inventory is not a license clearance or a guarantee of offline
operation.

## Verification

From `sih_fron`:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
DISASTER_TEST_CONNECTED_CHAT=1 npm run test:e2e
```

The last command is POSIX shell syntax. On other shells, set
`DISASTER_TEST_CONNECTED_CHAT` to `1` for that command only, then unset it.
The default suite builds with no backend and checks all public/game/learning/account
journeys. The configured-chat suite performs a separate production build with the
fixed local `http://127.0.0.1:4181/mock-api` endpoint and selects only the connected
chat journeys. Browser requests to that endpoint are intercepted; no real backend
or hosted service is contacted. Neither build is a deployment artifact.

The CI definition runs both browser modes after local checks; a hosted CI run is
not yet verified. Remaining acceptance includes other browsers/real touch devices,
actual audio/WebGL hardware, asset provenance, independent instructional-content
review and explicitly authorized backend/provider/deployment checks.
