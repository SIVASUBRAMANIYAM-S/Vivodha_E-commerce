# Phase 3 handoff

Updated: 2026-10-09. Implementation in progress on this branch — not paused. **Checkpoint 1 passed** (owner tested on a real iPhone in Expo Go). This section is kept current as each commit lands so anyone pulling the branch mid-phase — including a teammate joining partway through — has an accurate picture.

## Branch and transfer

- Continue the existing `phase-3-mobile-auth-onboarding` branch; default branch is `main`.
- Phase 2 work was merged before this branch was created. Phase 3 plan is approved.
- Phase 3 work is being **committed progressively to this branch** as each chunk lands (see "Work completed" below), not batched at the end. The branch has not been pushed or opened as a PR yet — that happens once the owner has reviewed on-device (Checkpoint 1, then Checkpoint 2).
- Do not transfer credentials, CLI temporary state, or `node_modules` between computers.
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
- Onboarding/auth screens (Step 6): `app/index.tsx` → `(onboarding)/splash` (waits on auth-store init, routes by session/pincode); `(onboarding)/welcome.tsx`; `(onboarding)/location/` restructured into a 4-route sub-stack (`index` choice, `search` pincode entry, `address-form`, `result`); `(auth)/login.tsx`, `signup.tsx` (branches into guest-conversion when already anonymous), `forgot-password.tsx`, plus three new screens `check-email.tsx`, `callback.tsx`, `set-new-password.tsx`.
- `src/features/location/` (new, pulled forward from Step 8 — only the slice onboarding needs): `api/serviceability.ts` (`check_pincode` RPC, no Edge Function needed), `api/addresses.ts` (create only — list/update/delete/set-default are still Step 8), `api/waitlist.ts`, `components/AddressForm.tsx` (shared with Account's future "add address", per the plan's own intent).
- `src/store/location-store.ts`: minimal in-memory `pincode`/`serviceable` fields (not yet persisted — Step 8 wraps this in `persist()`).
- `app.json`: added the `expo-location` config plugin (permission string) — was missed when the package was installed.
- ADR-149 through ADR-153 recorded in [decisions.md](decisions.md): PKCE + the single `/callback` deep-link target, the Expo Go deep-link limitation and its check-email fallback, Turnstile verified by GoTrue (not a second secret), the on-device-geocoder interim choice for GPS detection, and unserviceable-never-blocks.
- Verified via `expo export --platform web`: every route in the app (new and existing) renders without error. (Web itself is **not** a valid test target for this phase — `react-native-webview` has no web implementation, so the Turnstile gate can't complete there. Android/iOS Expo Go only.)

### Checkpoint 1 — fixes found during owner's on-device test (2026-10-09)

The owner tested on a real iPhone in Expo Go. Three issues surfaced and were fixed on this branch:

- **Turnstile widget rejected with "That check didn't go through."** The WebView loaded the Turnstile HTML via `source={{ html }}` with no `baseUrl`, giving it an opaque/null origin on iOS. Cloudflare's widget was configured with hostname `localhost` (the Cloudflare dashboard requires at least one hostname; `localhost` is the standard placeholder for a WebView-embedded widget with no real domain), and the null origin didn't match it. Fixed by adding `baseUrl: 'https://localhost'` to the WebView's `source` in `TurnstileGate.tsx`, so its origin matches what's registered.
- **The pincode input's number-pad keyboard covered the "Check availability" button**, with no way to reach it (iOS's number-pad has no visible Done/Return key). Fixed at the `Screen` component level (`src/components/ui/Screen.tsx`) by wrapping its content in `KeyboardAvoidingView` — this benefits every screen built on `Screen`, not just this one.
- **No way to log out to test guest mode / forgot-password after already being logged in.** Added a temporary "Log out" button to the Account tab placeholder (clears the cart, keeps location, matches the full rewrite's eventual behavior). The full Account tab rewrite is still Step 8; this is scaffolding that Step 8 will replace.

**Known gap, not yet verified:** the owner did not test the forgot-password flow end-to-end (reset link → set new password → log in with it). This is expected to be **untestable in Expo Go as currently built** — unlike signup's check-email screen, there is no "Continue" fallback for password recovery, because setting a new password requires a real recovery session established via the `/callback` deep-link code exchange, and Expo Go can't open `vivodha://` links at all. Verifying this flow needs either a dev client build or waiting until EAS dev-client tooling is set up. Recorded as an open question below — **do not assume this flow works until it's tested in a dev client or production build.**

Not yet started: the four Edge Functions (Step 7), the rest of the location feature — list/edit/delete addresses, default selection, address switcher, `UnserviceableNotice`, `location-store` persistence (Step 8), the full Account tab rewrite. See "Remaining approved implementation" below, which is kept in the same order as the approved plan's steps.

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
- [x] Session restoration/start routing, Welcome, onboarding location sub-stack, auth screens (login/signup/forgot-password/check-email/callback/set-new-password) — Step 6.
- [x] **Checkpoint 1 — passed 2026-10-09.** Owner tested on a real iPhone in Expo Go: guest mode, signup, email confirmation, login, location (both GPS auto-detect and manual pincode entry, address form save). Three bugs found and fixed (see above). Forgot-password was not tested end-to-end — known gap, see above.
- [ ] **Next up: Step 7 — four typed, validated, rate-limited Edge Functions**: `username-login`, `geocode-reverse`, `places-autocomplete`, `places-details`. Google calls stay server-side; username login must not expose the resolved email and must use generic invalid-credential errors. The owner runs `pnpm supabase functions deploy <name>` themselves for each one — the assistant writes the code but never deploys it.
- [ ] Step 8 — the rest of the location feature: list/edit/delete addresses, set-default, address switcher sheet (opened from the Home header), `UnserviceableNotice` (dismissible, shown on product/cart screens), `location-store` persistence (wrap in `persist()`/AsyncStorage, same pattern as `cart-store`).
- [ ] Step 8 — full Account tab rewrite: guest card (create account/log in) vs signed-in view (profile, address list, real logout replacing the Step-6 scaffolding), explanatory (non-functional) account-deletion entry.
- **Checkpoint 2, mandatory, after Step 7-8: real Android/iOS Expo Go review again before docs/PR.**
- [ ] Final docs sweep (this file + phases/decisions/screens/user-flows/edge-functions/rls-policies/open-questions as needed — most of this has been kept current already, not batched); `pnpm lint`/`typecheck`/`format:check`; `expo-doctor`; verify both apps start; review secrets/RLS; push the branch and open a PR (owner reviews/merges — never merged by the assistant).

## Configuration and constraints

- Owner reports Resend SMTP, Turnstile attack protection, and Google Maps Edge Function secret configured.
- **Done:** `EXPO_PUBLIC_TURNSTILE_SITE_KEY` is set in the owner's local `apps/mobile/.env` (not committed — see Security rules in CLAUDE.md; only the variable _name_ is in `.env.example`). The Cloudflare Turnstile widget was created with hostname `localhost` (the dashboard requires at least one; this is the standard placeholder for a WebView-embedded widget with no real domain — see the Checkpoint 1 fix above re: `baseUrl`). **Anyone else working on this branch needs their own `.env` to have this line, or the app throws a clear "missing site key" error at startup** — ask the owner for the value, never commit it.
- **Done:** `vivodha://**` added to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs (no `exp://` entry — Expo Go's URL is unstable per-network/port, so it can't be a deep-link target; Expo Go flows fall back to an in-app "Continue" button instead, per ADR-150 — except password recovery, which has no such fallback; see the known gap above).
- Ask for real delivery pincodes/ETAs; keep marked development placeholders if unavailable.
- Only pre-approved new libraries: `react-native-webview`, `expo-location`, `expo-linking`, `expo-secure-store` (the latter two already exist). Install mobile packages with `npx expo install`; ask before any other library.
- Preserve existing UI kit/tokens/motion, accessibility, reduced motion, loading/empty/error/offline states, and keyboard-safe forms. UX patterns only; no competitor assets.
- `ensureGuestSession(captchaToken)` now requires a solved Turnstile token (done). Existing startup/auth/location/account routes are still Phase 0/2 placeholders, not yet Phase 3-complete (Step 6 onward).
- Preserve existing auth profile/admin-invite triggers and secure session storage. No passwords stored. Clear user-scoped state on logout/account switch; retain cart for same-ID conversion.
- Start mobile via `pnpm dev:mobile` from the repository root, not plain root-level Expo startup (which previously resolved the wrong App entry).

## Validation so far

- pgTAP: 32/32 assertions passed on hosted DEV (2026-10-09).
- `pnpm typecheck`, `pnpm lint` (mobile), `npx expo-doctor` (21/21): all clean as of the last commit on this branch.
- `expo export --platform web`: every route renders without error (web is not a sign-off target for this phase — see above).
- Checkpoint 1: passed on a real iPhone in Expo Go (2026-10-09) — guest mode, signup, email confirmation, login, location (GPS + manual pincode), address form. Forgot-password not tested end-to-end (known gap, see above).
- Not yet run: `pnpm format:check` across the whole repo, admin app start check (no admin changes this phase, low risk but not re-verified).
- Checkpoint 2 (after Step 7-8) has not happened yet.
