# Phase 3 handoff

Updated: 2026-10-08. Work paused at the owner's request to continue on another computer.

## Branch and transfer

- Continue the existing `phase-3-mobile-auth-onboarding` branch; default branch is `main`.
- Phase 2 work was merged before this branch was created. Phase 3 plan is approved.
- Phase 3 changes are **uncommitted**. No Phase 3 commit, push, or PR was made by this assistant. A fresh clone will not include these working-tree changes.
- Transfer the changed/new files below through an owner-approved method before continuing. Do not discard them or assume they are on the remote branch. Do not transfer credentials, CLI temporary state, or `node_modules`.
- On the next computer, read [CLAUDE.md](../CLAUDE.md), [.github/copilot-instructions.md](../.github/copilot-instructions.md), the Phase 3 specifications, and this handoff. Inspect `git status`, current branch, and recent commits before editing. This is continuation of an approved phase, not a new phase.
- Do not use Docker. Do not commit/push the unfinished work without owner approval. Never merge into the default branch.

## Work completed

### Database foundations

Created [migration 14](../supabase/migrations/20261008143000_14_auth_onboarding.sql):

- Backend-only request limiter and private 24-hour username reservations.
- Auth trigger to validate signup metadata and finalize username/profile on confirmed permanent signup.
- Removed direct client username writes; added boolean-only throttled username availability RPC.
- Minimal public `check_pincode` RPC; removed public coverage-table read policy; added minimum order field.
- Insert-only public/customer pincode waitlist with admin-only reads. Historical serviceability requests retained, with new client inserts revoked.
- Atomic own-address default selection RPC.

Created [Phase 3 pgTAP tests](../supabase/tests/database/05_auth_onboarding.sql), covering privileges/RLS, signup confirmation, same-user guest conversion/address preservation, username claims, serviceability, waitlist access, limiter validation, and address ownership/defaults. **These tests have not been run successfully yet.**

### Documentation

Modified:

- [phases.md](phases.md): Phase 3 is mobile auth/onboarding; admin core moves to Phase 4, later phase numbers retained.
- [decisions.md](decisions.md): ADR-143 through ADR-148 record ordering, configuration, identity/serviceability decisions, mandatory Android reviews, and no-Docker hosted validation.
- [data-model.md](data-model.md), [rls-policies.md](rls-policies.md): migration additions and policy/testing guidance.
- [open-questions.md](open-questions.md): real pincodes, owner-entered site key, deletion deferral and hosted validation.
- This handoff is a new file.

No Phase 3 mobile screens, Edge Functions, dependency additions, or generated database-type updates have been implemented yet.

## Hosted DEV status (owner-reported)

DEV project ref: `nzltgmfodazrhrxufpwe` (public identifier, not a credential).

1. `pnpm supabase link --project-ref nzltgmfodazrhrxufpwe` succeeded on the current computer.
2. `pnpm supabase db push --dry-run` listed only migration 14.
3. Owner ran `pnpm supabase db push`: migration 14 applied successfully.
4. Owner ran the following in the Supabase SQL Editor successfully:

   ```sql
   create extension if not exists pgtap with schema extensions;
   ```

5. **The complete pgTAP test script is still pending.** Extension installation returning no rows is expected; it is not test-pass evidence.

The migration is already applied to DEV. Do not edit the applied migration to fix a schema bug; use a new corrective migration and the owner-run push gate. Local edits to tests/docs do not alter hosted schema.

## Exact next steps

1. Ask the owner to run the **entire** [test script](../supabase/tests/database/05_auth_onboarding.sql) in the DEV Supabase SQL Editor, including its opening transaction and final rollback. SQL is not a PowerShell command. Inspect every assertion for `not ok`; a generic query-success message is insufficient. If an error prevents the final rollback, run `rollback;` separately. Ask for sanitized results only.
2. Resolve any failures without Docker. Distinguish a test-harness issue from a schema defect. Do not claim database validation passed until actual results are available.
3. After tests pass, regenerate database types using `pnpm db:types`. On the new computer, owner may need to authenticate/link the Supabase CLI again; enter credentials privately, never in files or chat.
4. Continue the approved implementation below. Read [apps/mobile/AGENTS.md](../apps/mobile/AGENTS.md) and version-matched documentation before mobile changes.

## Remaining approved implementation

- Session restoration/start routing, Welcome, Turnstile WebView, persistent CAPTCHA-protected guest sign-in.
- Shared signup schemas, debounced availability, password strength, signup/email confirmation/deep links, username/email login, password reset, friendly errors and logout.
- Guest-to-account conversion must preserve the same auth user ID/cart/addresses. Verify Supabase confirmation/password ordering rather than assuming a combined update works.
- Four typed, validated, rate-limited Edge Functions: `username-login`, `geocode-reverse`, `places-autocomplete`, `places-details`. Google calls stay server-side; username login must not expose the resolved email and must use generic invalid-credential errors.
- **Pause after auth for real Android Expo Go screenshots/recordings. Web preview is not sign-off for this phase.**
- Location permission/GPS, manual Places or pincode fallback, address form/CRUD/defaults, serviceability, waitlist, delivery-header address switcher and gentle unserviceable-cart notice.
- Minimal Account guest/permanent views and explanatory deletion entry (full deletion deferred).
- **Pause again after location for real Android Expo Go screenshots/recordings.**
- Update related user-flow/screen/Edge Function/RLS/phase/decision/open-question docs; run lint, typecheck, format and Expo Doctor; verify both apps start; review secrets/RLS; Conventional Commits with Copilot co-author, branch push and templated PR. Never merge.

## Configuration and constraints

- Owner reports Resend SMTP, Turnstile attack protection, and Google Maps Edge Function secret configured.
- Ask owner to enter the public Turnstile site key locally as `EXPO_PUBLIC_TURNSTILE_SITE_KEY`; add its name to the env example. Never ask for a key/password in chat. Exact Supabase redirect URLs, including the actual Expo Go development URL on the new computer, still need documenting/configuring.
- Ask for real delivery pincodes/ETAs; keep marked development placeholders if unavailable.
- Only pre-approved new libraries: `react-native-webview`, `expo-location`, `expo-linking`, `expo-secure-store` (the latter two already exist). Install mobile packages with `npx expo install`; ask before any other library.
- Preserve existing UI kit/tokens/motion, accessibility, reduced motion, loading/empty/error/offline states, and keyboard-safe forms. UX patterns only; no competitor assets.
- Existing `ensureGuestSession()` signs in without CAPTCHA and must be replaced/adapted. Existing startup/auth/location/account routes are not Phase 3-complete.
- Preserve existing auth profile/admin-invite triggers and secure session storage. No passwords stored. Clear user-scoped state on logout/account switch; retain cart for same-ID conversion.
- Start mobile via `pnpm dev:mobile` from the repository root, not plain root-level Expo startup (which previously resolved the wrong App entry).

## Validation at pause

- Changed documentation formatting and `git diff --check` passed before this handoff; the handoff is checked separately when saved.
- Local database tests previously could not run; Docker use was explicitly prohibited afterward.
- Hosted migration application and pgTAP extension creation are owner-confirmed, not a pgTAP pass.
- Full Phase 3 lint/typecheck/Expo Doctor/app/device checks remain pending.
- Dev-server processes are not transferred between computers; their current readiness is not verified.
