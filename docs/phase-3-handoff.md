# Phase 3 handoff

Updated: 2026-10-09. Implementation in progress on this branch — not paused. This section is kept current as each commit lands so anyone pulling the branch mid-phase has an accurate picture.

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

Created [Phase 3 pgTAP tests](../supabase/tests/database/05_auth_onboarding.sql), covering privileges/RLS, signup confirmation, same-user guest conversion/address preservation, username claims, serviceability, waitlist access, limiter validation, and address ownership/defaults. **The owner ran the full test script against hosted DEV on 2026-10-09: all 32 assertions passed (`ok 1` through `ok 32`).** `packages/shared/src/types/database.ts` was regenerated (`pnpm db:types`) immediately after, so all Phase 3 code is built against real generated types, not hand-written ones.

### Documentation

Modified:

- [phases.md](phases.md): Phase 3 is mobile auth/onboarding; admin core moves to Phase 4, later phase numbers retained.
- [decisions.md](decisions.md): ADR-143 through ADR-148 record ordering, configuration, identity/serviceability decisions, mandatory Android reviews, and no-Docker hosted validation.
- [data-model.md](data-model.md), [rls-policies.md](rls-policies.md): migration additions and policy/testing guidance.
- [open-questions.md](open-questions.md): real pincodes, owner-entered site key, deletion deferral and hosted validation.
- This handoff is a new file.

### Mobile app (this branch, since pgTAP verification)

- `expo-location` and `react-native-webview` installed (`npx expo install`), the only two pre-approved libraries not already present.
- `src/lib/supabase.ts`: client config switched to `flowType: 'pkce'` (stable `?code=` deep links); `ensureGuestSession(captchaToken)` now requires a solved Turnstile token.
- `src/lib/turnstile.ts` (new): builds the self-contained Turnstile widget HTML for the WebView.
- `src/components/auth/TurnstileGate.tsx` (new) + `TurnstileProvider`, mounted in `app/_layout.tsx`: `useTurnstile().present(action)` returns a Promise of the solved token, or rejects with `CAPTCHA_CANCELLED`/`CAPTCHA_EXPIRED`/`CAPTCHA_FAILED:*`.
- `src/features/auth/`: `api/signup.ts`, `api/login.ts` (email direct, username via the still-to-be-written `username-login` Edge Function), `api/password-reset.ts`, `api/guest-conversion.ts`, `api/username-availability.ts` (debounced), `api/errors.ts` (`mapAuthError()` — the one place GoTrue/Edge-Function errors become friendly strings), `store/auth-store.ts` (Zustand, mirrors `onAuthStateChange`, initialized once from `app/_layout.tsx`), `components/PasswordStrengthMeter.tsx`.
- `src/lib/function-error.ts` (new): parses an Edge Function's `{error:{code,message}}` body off `FunctionsHttpError`.
- `apps/mobile/.env.example`: added `EXPO_PUBLIC_TURNSTILE_SITE_KEY=` (name only — the owner pastes the real value into `.env`).

Not yet started: onboarding/auth screens (Step 6), deep-link callback route, the four Edge Functions (Step 7), location feature (Step 8), Account tab rewrite. See "Remaining approved implementation" below, which is kept in the same order as the approved plan's steps.

## Hosted DEV status (owner-reported)

DEV project ref: `nzltgmfodazrhrxufpwe` (public identifier, not a credential).

1. `pnpm supabase link --project-ref nzltgmfodazrhrxufpwe` succeeded on the current computer.
2. `pnpm supabase db push --dry-run` listed only migration 14.
3. Owner ran `pnpm supabase db push`: migration 14 applied successfully.
4. Owner ran the following in the Supabase SQL Editor successfully:

   ```sql
   create extension if not exists pgtap with schema extensions;
   ```

5. **The complete pgTAP test script passed on 2026-10-09**: all 32 assertions `ok`. Database types were regenerated the same day.

The migration is already applied to DEV and confirmed correct. Do not edit the applied migration to fix a schema bug; use a new corrective migration and the owner-run push gate. Local edits to tests/docs do not alter hosted schema.

## Exact next steps

Database verification is done — the remaining work is entirely mobile app + Edge Functions. Continue the approved implementation below, in order. Read [apps/mobile/AGENTS.md](../apps/mobile/AGENTS.md) and version-matched documentation before mobile changes.

## Remaining approved implementation

- [x] Turnstile WebView + persistent CAPTCHA-protected guest sign-in (PKCE client config, `TurnstileGate`/`TurnstileProvider`).
- [x] Shared signup schemas, debounced availability, password strength, signup/login/password-reset API functions, guest-to-account conversion, friendly error mapping, `auth-store`. Guest-to-account conversion preserves the same auth user ID — confirmed against `@supabase/auth-js`'s actual `updateUser()` type signature (it does not accept `captchaToken`; the already-captcha-verified anonymous session needs none for that call).
- [ ] Session restoration/start routing, Welcome, onboarding location sub-stack, auth screens (login/signup/forgot-password/check-email/callback/set-new-password) — Step 6, not started.
- [ ] Four typed, validated, rate-limited Edge Functions: `username-login`, `geocode-reverse`, `places-autocomplete`, `places-details`. Google calls stay server-side; username login must not expose the resolved email and must use generic invalid-credential errors.
- **Pause after auth/onboarding screens for real Android Expo Go screenshots/recordings. Web preview is not sign-off for this phase.**
- [ ] Location permission/GPS, manual Places or pincode fallback, address form/CRUD/defaults, serviceability, waitlist, delivery-header address switcher and gentle unserviceable-cart notice.
- [ ] Minimal Account guest/permanent views and explanatory deletion entry (full deletion deferred).
- **Pause again after location for real Android Expo Go screenshots/recordings.**
- [ ] Update related user-flow/screen/Edge Function/RLS/phase/decision/open-question docs; run lint, typecheck, format and Expo Doctor; verify both apps start; review secrets/RLS; Conventional Commits, branch push and templated PR. Never merge.

## Configuration and constraints

- Owner reports Resend SMTP, Turnstile attack protection, and Google Maps Edge Function secret configured.
- `EXPO_PUBLIC_TURNSTILE_SITE_KEY` name added to `apps/mobile/.env.example`; **owner still needs to paste the real public site key into `apps/mobile/.env`** — `src/lib/turnstile.ts` throws a clear error at import time until that's done. Never ask for a key/password in chat.
- **Owner action still needed:** add `vivodha://**` to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs (no `exp://` entry — Expo Go's URL is unstable per-network/port, so it can't be a deep-link target; Expo Go flows fall back to an in-app "Continue" button instead, per the approved plan's Step 5).
- Ask for real delivery pincodes/ETAs; keep marked development placeholders if unavailable.
- Only pre-approved new libraries: `react-native-webview`, `expo-location`, `expo-linking`, `expo-secure-store` (the latter two already exist). Install mobile packages with `npx expo install`; ask before any other library.
- Preserve existing UI kit/tokens/motion, accessibility, reduced motion, loading/empty/error/offline states, and keyboard-safe forms. UX patterns only; no competitor assets.
- `ensureGuestSession(captchaToken)` now requires a solved Turnstile token (done). Existing startup/auth/location/account routes are still Phase 0/2 placeholders, not yet Phase 3-complete (Step 6 onward).
- Preserve existing auth profile/admin-invite triggers and secure session storage. No passwords stored. Clear user-scoped state on logout/account switch; retain cart for same-ID conversion.
- Start mobile via `pnpm dev:mobile` from the repository root, not plain root-level Expo startup (which previously resolved the wrong App entry).

## Validation at pause

- Changed documentation formatting and `git diff --check` passed before this handoff; the handoff is checked separately when saved.
- Local database tests previously could not run; Docker use was explicitly prohibited afterward.
- Hosted migration application and pgTAP extension creation are owner-confirmed, not a pgTAP pass.
- Full Phase 3 lint/typecheck/Expo Doctor/app/device checks remain pending.
- Dev-server processes are not transferred between computers; their current readiness is not verified.
