# Local demo accounts and profiles

These screens demonstrate account UI, not authentication. Passwords, roles, profile
details and statistics are editable plain-text browser storage. They are not sent
to the Python backend and do not authorize any server operation. Use synthetic
names and passwords, never real credentials or private information.

## User flow

- `/account` signs in or explicitly creates a student/teacher demo account. No
  default administrator is created on page load. New accounts have no invented
  scores, levels or badges.
- `/login` signs in an existing teacher demo account and opens `/leaderboard`.
  It uses the same active identity as `/account/dashboard`; the old unrelated
  `isAdmin` and `adminName` flags no longer control navigation.
- `/account/dashboard` shows the active profile and stored student fields, or a
  teacher's local student roster. The gate redirects signed-out visitors to
  `/account`. A student cannot enter the teacher leaderboard through this UI.
  **Editing storage can bypass these demo role checks.**
- Edit profile opens a keyboard-accessible modal. Username, optional email and
  avatar remain a draft until Save changes succeeds. Cancel or Escape discards
  the draft, cancels image work and returns focus to the opener.
- Log out clears the active pointer, not the records or plain-text passwords.
  It is not account deletion or data erasure. Failed logout is reported rather
  than pretending the session ended.

## Code ownership

Paths are relative to `sih_fron/src/features/accounts/`.

| File | Responsibility |
| --- | --- |
| `demoUsers.ts` | Typed records, runtime parsing, legacy reads and single-write mutations |
| `useDemoAccounts.ts` | Stable React snapshots and same-tab/cross-tab storage subscriptions |
| `DemoAccountGate.tsx` | Navigation convenience and visible storage errors, not authorization |
| `AccountForm.tsx` | Shared registration/general sign-in/teacher sign-in form |
| `ProfileEditor.tsx` | Modal, editable draft, save feedback and pending-image lifetime |
| `avatar.ts` | Bounded raster validation, file reading, decoding, timeout and cancellation |
| `AccountStats.tsx`, `statistics.ts` | Stored values, roster and explicit ranking rules |
| `DemoNotice.tsx` | Shared plain-language privacy and demo limitations |
| `Scenes.tsx` | Existing decorative dashboard and trophy scenes |

Routes compose these pieces. Shared navigation lives in `features/navigation`;
optional WebGL/reduced-motion handling stays in `features/learning`. There is no generic account repository,
new state-management dependency or parallel authentication system.

## Storage contract and compatibility

The authoritative key is `disasterready.demoAccounts.v1`:

```json
{
  "version": 1,
  "users": [
    { "username": "Demo learner", "password": "demo-only", "role": "student" }
  ],
  "currentUsername": "Demo learner"
}
```

`currentUsername` is either `null` or an exact username in `users`. Registration,
sign-in, profile save and logout each write the complete envelope once. A failed
write cannot save a renamed user while leaving a separate active-user key stale.
Same-tab events and native storage events refresh the UI; no polling is required.

When the new key is absent, reads interpret the legacy `users` array and select
`currentUser` only if its username and role match a stored user. An invalid legacy
session is signed out. Merely visiting a page never seeds an account or writes a
migration. The first successful explicit mutation writes the new envelope.
Legacy keys remain unchanged for recovery; after migration, the new key wins even
when signed out. Old application versions do not read the new envelope, so avoid
using old and new versions against the same origin simultaneously.

Supported optional fields are `password`, `email`, `avatar`, `totalQuizzes`,
`averageScore`, `improvement`, `level` and `badges`. Known fields have checked types
and bounds. Only these supported fields and username/role are normalized into the
new envelope; other legacy metadata remains in the untouched legacy keys, not in
the migrated record. Scores must be finite percentages from 0 through 100; quiz
counts must be nonnegative integers; badges must be a bounded list of strings.

New names are trimmed, 1–80 characters and unique with case-sensitive comparison.
Sign-in tries the exact supplied name before a trimmed match, preserving legacy
names with surrounding spaces. Demo passwords are 1–128 characters in the forms.
Profile edits cannot change roles, passwords or statistics. Email is optional,
trimmed and format-checked; it is not verified or used to send mail.

Malformed records, duplicate names, unsupported versions and dangling new active
pointers produce an error instead of being silently replaced. Denied reads disable
account actions. Failed writes leave the previous stored state and editable draft
intact. Save compares the original normalized profile with the latest stored one;
a changed record requires canceling and reopening the editor before saving.

This is **not cross-tab transactional storage**. The stale-profile check catches an
already-observed changed record, but simultaneous read/modify/write operations can
still race. Do not use it as a multi-user database or a secure account service.

### Troubleshooting without losing records

1. For a storage error, check this site's browser storage permissions and available
   space. A failed save does not require discarding the form immediately.
2. For malformed data, first export/copy the affected origin's account keys to a
   private backup. They contain plain-text passwords; do not paste them into an
   issue, chat or source file.
3. Inspect the version, record types, duplicate names and active pointer. Repair
   only a backed-up local demo record you own, then reload. The app deliberately
   provides no automatic reset or destructive repair.
4. Legacy keys are a recovery source, not an up-to-date copy after migration.
   Removing the new key would discard access to newer changes and can revive a
   stale legacy session. Do not remove it as a routine troubleshooting step.

## Avatar behavior

Uploads remain local. Accept PNG, JPEG or WebP, at most 256 KiB, with decoded width
and height each between 1 and 4096 pixels. MIME type, raster signature and actual
browser decoding are checked. Reading/decoding has a ten-second limit; cancellation,
timeout, replacement and modal unmount release owned reader/image handlers.

The saved value is a bounded inline data URL, never a temporary object URL. It
survives reload; changing it does not affect the saved profile until Save succeeds.
There is no network upload. No image metadata stripping is performed, so use a
non-sensitive image and remember it remains in local storage.

Legacy remote/blob/SVG avatars remain in stored records but are not fetched or
rendered. The profile shows an initial and a replacement/removal notice. Remove
avatar is also a draft action until Save. These limits are not a substitute for
server-side upload validation if a real upload service is added later.

## Statistics and leaderboard

Lessons, drills and the standalone quiz do not persist results into these records.
Missing fields display as `—`, not fabricated zero-score attempts. A genuine stored
zero remains `0` / `0%`. Only stored badges appear; there are no automatically earned
sample achievements.

The leaderboard ranks students only when at least one quiz and an average score
are recorded. It sorts descending by that percentage, retaining storage order for
ties; ranks are display positions, not a competition tie policy. Other students
stay unranked and do not occupy podium slots. Improvement values are displayed as
stored, not reinterpreted as streaks. Print preserves the demo/unverified notice;
it does not issue a certificate or validated report.

## Verification and remaining limits

See the [README](../README.md#checks) for commands. `tests/accounts.test.ts` covers
parsing, lazy migration, credentials, single-write failures, stale edits, ranking,
image signatures, decoding, timeout and cleanup. `tests/browser/accounts.spec.ts`
covers signup/login/logout, teacher navigation, profile cancel/save/reload,
collisions, avatars, failed/blocked storage, native cross-tab events, stale drafts,
leaderboard updates, print labeling, a narrow modal and normal-motion scenes.

Tests use synthetic records, blocked external browser requests, mocked storage
failures and selected fake image readers. They do not establish real authentication,
cross-device persistence, simultaneous-write safety, every image codec/device,
privacy compliance or emergency-content accuracy. Real auth, verified teacher roles
and learning-result persistence need explicit product and backend contracts.
