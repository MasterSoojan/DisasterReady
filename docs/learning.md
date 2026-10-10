# Learning modules, drills and quiz

These screens are educational prototypes, not emergency guidance or safety
qualifications. The supplied instructional text, answer keys and scenario labels
were moved without changing their substance. Their accuracy, context and
age-appropriateness still require subject-matter review before public use.

## Where to make changes

Paths below are relative to `sih_fron/src/`.

| Area | Responsibility |
| --- | --- |
| `features/modules/data.ts` | Four authored lessons, three steps and one question per lesson |
| `features/modules/session.ts` | Selection, forward/back, answer feedback, completion and exit |
| `features/modules/Scene.tsx` | Existing lesson-specific 3D decoration and completion confetti |
| `features/drills/data.ts` | Three authored scenarios, choices, hints, sound paths and visual labels |
| `features/drills/session.ts` | Pure scoring, selected choices, deadline, expiry and completion rules |
| `features/drills/useDrill.ts` | Browser interval, audio/confetti ownership and user actions |
| `features/drills/audio.ts` | Optional background/effect playback, failure and cleanup |
| `features/drills/Scene.tsx` | Existing fire, earthquake, flood and completion decoration |
| `features/games/quiz/{questions,session,Scene}` | Question bank, pure answer/result transitions and globe decoration |
| `features/navigation/SiteHeader.tsx` | Shared public/learning/account navigation, mobile menu and theme control |
| `features/learning/DecorativeCanvas.tsx` | Optional 3D boundary; reduced-motion and unavailable-scene fallback |
| `app/{modules,drills,games/quiz}/page.tsx` | Route composition and screen presentation |

The reducers take explicit actions and return data. They do not know about React,
Three.js, audio, storage or HTTP. Each activity keeps its own rules; there is no
generic game engine or cross-project package.

## Lesson behavior

Lesson cards are real buttons and support keyboard activation. Each lesson starts
at its first step. Next advances through the supplied material before the question;
Back returns to the preceding step, or from the question to the last lesson step.
An incorrect answer gives inline feedback instead of opening a blocking browser
alert. A correct answer shows completion. Skip Quiz now returns to the lesson list
without marking the lesson complete; the previous button was a no-op.

Completion means only that the supplied question was answered correctly. The old
claim that the learner was now a safety expert was removed. Finish, All Modules
and starting a lesson again reset the local session. Back Home goes to `/`, even
when the route was opened directly without browser history.

## Timed drill behavior

- A new attempt starts with 60 seconds, zero points and no selected choices.
- A first correct selection awards 100 points. Repeating that selection does not
  award points again. A wrong choice subtracts 50 points (never below zero) and
  five seconds. The existing scoring and authored correct/incorrect choices remain.
- Completion requires **every** correct choice in the selected scenario and time
  remaining. It no longer relies on a hardcoded count of three choices, and cannot
  succeed after time expires merely because the choices were selected earlier.
- A `performance.now()` deadline drives the countdown. The 250 ms display interval
  is not the clock: each tick, choice and finish action checks elapsed time. A
  throttled tab cannot regain time just because fewer interval callbacks ran.
- Expiry disables choices and completion, shows a clear result and offers Try
  again. Restart resets the attempt; All drills exits it. Completion freezes the
  remaining time and score.
- Leaving, expiry and completion clear the owned interval. Navigation/unmount,
  muting and attempt changes stop owned audio. There is no delayed shake timeout
  that can update a later attempt; feedback drives the animation directly.

The mascot feedback no longer overlays the choice buttons. The timer and score
have accessible names, messages are announced, and narrow layouts keep actions
reachable. “Finish practice” and “Practice complete” replace claims of being safe
or surviving a real incident.

### Audio and decoration

Sound is optional. The adapter owns both the looping background and each one-shot
effect. It pauses and releases their sources on cleanup, removes event listeners,
and ignores late failures after disposal. Playback rejection, a media error or an
eight-second loading stall shows an unavailable/blocked notice without blocking
the drill. The sound toggle stops audio already playing, not just future effects.

The referenced `public/sounds/{siren,rumble,water,correct,wrong,win}.mp3` assets are
currently absent. No substitute asset or licensing claim was invented. Add reviewed,
licensed files at those paths if sound is wanted, and verify real playback and
autoplay restrictions on supported devices. Browser success-path tests use a fake
audio object; they do not establish codec support or actual sound quality.

The existing 3D scenes remain decorative. A failed WebGL/scene render must not take
the lesson controls down. Reduced-motion preference uses the CSS background without
the canvas or lesson confetti; drill confetti also respects reduced motion. This is
not a claim that every existing Framer Motion entrance/hover animation is disabled.
The fire lesson's decorative captions use browser text rather than a network-backed
3D font worker; a blocked font-index request previously raised an uncaught error.
Cloud loading still has an external dependency, but failed loads now omit the
clouds through the shared [optional-texture adapter](public-pages.md). No new
remote texture was added. The drill cards' redundant external notebook texture was removed.

## Standalone quiz

The ten local questions remain independent from the backend's placeholder quiz
endpoint. One accepted answer locks the question and awards at most one point.
Invalid/repeated answers and advancing without an answer are ignored. Feedback
includes the expected answer as text, not just color. The last action is View
results; Retake resets the question, score and answer. Back to games is available
before completion.

Lessons, drills and this quiz keep state only for the mounted page visit. They do
not persist attempts, update the prototype account's statistics, issue badges or
certificates, or submit anything to a backend. Reload/navigation resets progress.
Adding persistence would require a defined data contract, not invented dashboard
numbers.

## Verification and remaining acceptance

From the repository root, run `npm run check:frontend`. From `sih_fron`, run
`npm run test:e2e` for the production browser suite. See the [README](../README.md)
for setup and [Project Pulse](../../Project_Pulse.md) for recorded runs.

- Domain tests cover authored-data structure, lesson navigation/skip, quiz answer
  locking/results, drill scoring/penalties, deadline boundaries and expired finish.
- Audio tests cover successful playback ownership, ended/error events, rejected or
  stalled playback, cleanup and late-event suppression.
- Browser checks exercise all four lessons, all three drills, the complete quiz,
  mobile navigation, repeat clicks, expiry/retry, audio mute/unmount, reduced motion,
  unavailable WebGL, normal-motion scene mounting and a 375px touch choice.
  External services are blocked/mocked.

Still required: independent instructional-content review, asset ownership/licensing,
real audio/WebGL and touch acceptance across supported browsers/devices, and any
decision to persist learning results. [Demo accounts and profiles](accounts.md)
documents the separate local-storage implementation; broader sample claims and
asset ownership elsewhere still need review.
