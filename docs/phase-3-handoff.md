# Phase 3 teammate handoff

Updated: **2026-10-13, merge reconciliation**. Work is being saved for teammate continuation after the owner encountered a diverged-branch push. This document replaces the earlier pause notes; it is the authoritative resume checklist.

## Start here

- **Phase 3 is incomplete.** Auth implementation requires Android review. Teammate location/address prototypes are preserved but are not the active onboarding entry; full location integration and Google endpoints remain pending. Phase 4 is admin core, not the next immediate task.
- Continue `phase-3-mobile-auth-onboarding`. Reconciliation integrates local `68c0f54` and 13 incoming commits through `075a75f`, preserving both histories after foundation `700551e`. Do not use force-push. Read the final commit history/status to confirm transfer.
- **Transfer safety:** after the merge is committed and pushed, teammates can obtain the source through this branch. The ignored local CAPTCHA opt-in still does not transfer through Git. Do not transfer credentials, Supabase CLI login state, `node_modules`, build caches or session tokens. Do not reset/discard unexpected working-tree changes.
- Local mobile and admin servers started by this session have been stopped. Hosted Supabase and deployed Edge Functions remain running; the DEV CAPTCHA exception also remains active.
- Read [CLAUDE.md](../CLAUDE.md), [mobile instructions](../apps/mobile/AGENTS.md), [phases](phases.md), [user flows](user-flows.md), [screens](screens.md), [decisions](decisions.md) and [open questions](open-questions.md) before implementation. The current phase plan is approved, with mandatory Android review pauses.
- **No Docker. No database passwords in files, commands or chat. Never push/merge into main or force-push.**

## Hosted DEV and current configuration

Project ref: `nzltgmfodazrhrxufpwe` (public identifier). This is DEV; production is a separate future project.

| Setting            | Current evidence / action                                                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema             | All 14 local/remote migrations matched at validation. Owner applied migration 14; no further schema push needed for auth.                                                                                         |
| pgTAP              | Owner enabled extension in `extensions`; 32 rollback-based assertions passed through the hosted SQL API.                                                                                                          |
| username-login     | Deployed by assistant with `--use-api`, including DEV-only CAPTCHA exception.                                                                                                                                     |
| CAPTCHA protection | Owner reports OFF in hosted Auth as requested. Bot protection is reduced until restored.                                                                                                                          |
| Endpoint exception | Assistant set server-only `DEV_DISABLE_CAPTCHA=true` on explicit DEV project.                                                                                                                                     |
| Mobile exception   | Ignored `apps/mobile/.env.local` sets `EXPO_PUBLIC_DEV_DISABLE_CAPTCHA=true` on this computer. **Not transferred by Git.**                                                                                        |
| App safeguards     | Exception requires a development bundle AND the exact DEV URL. Default/production bundles and other project URLs still require CAPTCHA. Client cannot override endpoint policy.                                   |
| Auth settings      | Owner screenshots confirmed signups, anonymous sign-ins, email confirmation and manual linking enabled. Minimum password length 8 still needs dashboard confirmation.                                             |
| Redirects          | Owner configured `vivodha://**` plus Expo Go/browser callbacks. Recheck exact URLs for the teammate's LAN IP/port, including conversion and recovery variants.                                                    |
| Site URL           | `http://localhost:3000` was retained for DEV; mobile supplies explicit callback URLs. It is not a Turnstile setting.                                                                                              |
| Turnstile          | Owner supplied public site key and allowed hostnames. Chrome and phone worked per owner; VS Code integrated browser failed with error 300030 in protected mode. Keep widget/keys for restoration.                 |
| Google/SMTP        | Owner previously reported Google secret and Resend SMTP configured. Names, API enablement, billing and actual Google connectivity still need verification before location work; never request key values in chat. |

Production bundle safeguards do **not** restore hosted DEV bot protection. CAPTCHA-disabled tests cannot count as CAPTCHA sign-off.

### Recreate the temporary local exception on another computer

Only if continuing owner-approved DEV testing, create ignored `apps/mobile/.env.local`:

```dotenv
EXPO_PUBLIC_DEV_DISABLE_CAPTCHA=true
```

Do not replace the owner's mobile `.env` or print its contents. Use `.env.example` for variable names and obtain approved public configuration through the owner. The app displays a visible **DEV only: CAPTCHA is temporarily disabled** warning and sends no fabricated verification token.

### Restore CAPTCHA before production or CAPTCHA review

1. Remove the local opt-in or set it to `false`; restart Expo and fully reload the app.
2. Set the endpoint policy back to its protected mode:

   ```powershell
   pnpm supabase secrets set DEV_DISABLE_CAPTCHA=false --project-ref nzltgmfodazrhrxufpwe
   ```

3. Re-enable CAPTCHA protection in Supabase DEV Auth with the existing Turnstile configuration.
4. Confirm allowed `localhost` and native HTTPS-origin hostnames; repeat actual challenge/guest/signup/login/reset/resend tests in Chrome and Android.

See [auth configuration and restoration](user-flows.md#temporary-dev-captcha-exception-2026-10-13).

## Completed implementation

### Database foundations

[Migration 14](../supabase/migrations/20261008143000_14_auth_onboarding.sql) provides:

- Backend-only durable request limiter; private 24-hour username reservations.
- Confirmation trigger that validates signup metadata and finalizes username/profile atomically.
- Boolean-only, throttled username availability RPC; no direct client username writes.
- Public `check_pincode` RPC with private coverage-table access and minimum-order data.
- Insert-only pincode waitlist for public/customer callers; admin-only reads. Historical serviceability requests preserved, with new client inserts closed.
- Ownership-checked atomic default-address selection RPC.

Applied migrations must not be edited to correct schema bugs. Add a corrective migration and retain owner-run push approval. Generated [database types](../packages/shared/src/types/database.ts) were refreshed.

### Mobile auth and local ownership

- Session restoration/validation, auth state provider, route gates and deep-link handling.
- Welcome and persistent anonymous guest session.
- Signup with shared Zod validation, live username availability and password strength/show-hide.
- Email or username login with friendly generic errors.
- Confirmation/check-email/resend, password recovery and password setup.
- Guest conversion: update email/metadata on the existing identity, confirm email, then re-enter a password. No password is retained across email confirmation; pending metadata is routing-only, not authorization.
- Account guest/permanent views, local logout and explanatory deletion entry. **Actual account deletion is not implemented** and must ship before Play release.
- Local cart binds to user ID: same-ID conversion retains cart; logout/different-user login clears cart and user-scoped cache. Server cart is deferred to Phase 6.
- Default CAPTCHA enforcement plus the explicit temporary DEV exception across guest, signup, email/username login, recovery and resend.
- `/location` is deliberately a **pending setup** screen with a browse option. It does not claim coverage or save addresses. Teammate prototypes are retained at `/location/choice`, `/location/search`, `/location/result` and `/location/address-form`; do not treat them as a completed location feature.

### Merge reconciliation and incoming work

- One root `AuthProvider` owns restoration, cache/cart binding, recovery and callbacks. Teammate session hooks read this provider instead of initializing a second independent auth store.
- Teammate auth API modules delegate to the validated local API, avoiding divergent CAPTCHA policies, hand-written endpoint response shapes and unsupported combined guest email/password updates.
- Adopted incoming PKCE mode. New requests use `/auth-callback` with explicit recovery/conversion intent. Legacy `/callback` and `/set-new-password` routes delegate to the same handling; old implicit links remain parseable. Recovery events emitted during PKCE exchange are preserved even for old links without intent.
- Kept `expo-location`, its plugin, shared address/reset/waitlist schemas, location prototype API/forms/store and base-screen keyboard avoidance. Kept newer SDK patch versions and regenerated the combined lockfile.
- Incoming docs record an earlier owner iPhone Expo Go checkpoint for the teammate implementation. It is historical evidence only, not Android or merged-code sign-off. Duplicate/conflicting ADR numbers were consolidated in ADR-152 through ADR-154; obsolete retained-password/Expo-Go-impossibility assumptions are not carried into active auth.

### username-login endpoint

- Shared request/session response schemas; private service-role identity lookup and separate anon Auth sign-in client.
- Returns session fields only, not a resolved email/user object. Unknown username/wrong password use the same generic rejection.
- Durable SHA-256-subject limits: 20/IP/minute, 10/username/minute. Missing gateway address/limiter/backend failures fail closed.
- CORS and no-store responses. Only this public login endpoint has gateway `verify_jwt=false`.
- CAPTCHA omission permitted only by server opt-in on the exact DEV URL; default missing-token requests rejected before backend calls.

### Dependencies

Added approved `react-native-webview` 13.16.1 through Expo installer and retained incoming `expo-location` ~57.0.20. SDK patch alignment: Expo 57.0.28, Router 57.0.26, Splash 57.0.10, Expo UI 57.0.23. Preserve package manifests, lockfile and workspace release-age exceptions together.

Repo targets Node 22; actual validation runtime was Node 24.19.0. Node-version decision remains open. No need to add a test runner dependency: temporary `pnpm dlx tsx` handles shared bundler imports.

## Files to preserve and inspect

Run `git status --short` for the complete transfer list: `git diff --stat` alone excludes untracked implementation files.

| Area                   | Primary files                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile routes          | [app](../apps/mobile/app): root/layout, auth, onboarding, tabs; new check-email, set-password and auth-callback routes                                    |
| Auth API/provider/UI   | [auth feature](../apps/mobile/src/features/auth): APIs, callback/session routing, provider, forms, CAPTCHA native/web, Account and hooks                  |
| Session/CAPTCHA policy | [supabase client](../apps/mobile/src/lib/supabase.ts), [DEV policy](../apps/mobile/src/lib/captcha-policy.ts), existing secure-storage adapter            |
| Cart ownership         | [cart store](../apps/mobile/src/features/cart/store/cart-store.ts)                                                                                        |
| Shared validation      | [auth API schemas](../packages/shared/src/schemas/auth-api.ts), [schema exports](../packages/shared/src/schemas/index.ts)                                 |
| Endpoint               | Entire [username-login directory](../supabase/functions/username-login), including index, handler, tests, Deno config and lock                            |
| Tests/types/config     | [mobile tests](../apps/mobile/tests/auth.test.mjs), [pgTAP suite](../supabase/tests/database/05_auth_onboarding.sql), generated DB types, Supabase config |
| Package/config changes | Mobile package, root lockfile, workspace config, public env example. Preserve owner-edited env; recreate ignored local DEV opt-in separately.             |
| Docs                   | PRD, data model, decisions ADR-143 through ADR-154, Edge Functions, phases, RLS, screens, user flows, open questions and this handoff                     |

## Validation evidence at pause

These are previous results, not a substitute for rerunning checks after transfer or further changes.

| Exact command / check                                                                                                 | Result and scope                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dlx tsx --test apps\mobile\tests\auth.test.mjs supabase\functions\username-login\handler.test.ts`               | **22/22 passed** after merge; includes protected-default rejection, development/project safeguards, token omission, retained limits, generic errors and legacy PKCE callback compatibility.                                                                                                    |
| `pnpm supabase db query --linked --file supabase\tests\database\05_auth_onboarding.sql`                               | **32/32 passed**; fixtures rolled back. `finish(true)` ensures failure assertions raise errors.                                                                                                                                                                                                |
| `pnpm exec turbo run lint typecheck --filter=mobile --filter=@vivodha/shared`                                         | **4/4 tasks passed** after exception.                                                                                                                                                                                                                                                          |
| `pnpm exec turbo run lint typecheck`                                                                                  | **6/6 tasks passed** after reconciliation, including admin. First attempt hit stale generated Expo route types; starting the merged Expo app regenerated them, and the repeat passed without casts or source workarounds.                                                                      |
| `pnpm install --frozen-lockfile`                                                                                      | Passed with the regenerated combined lockfile; retained incoming expo-location and newer local SDK patch versions.                                                                                                                                                                             |
| `pnpm dlx expo-doctor` (from mobile)                                                                                  | **21/21 passed** after reconciliation.                                                                                                                                                                                                                                                         |
| Merged app startup/bundling                                                                                           | Mobile welcome HTTP 200; admin HTTP 200; full Android bundle HTTP 200, **14,382,203 bytes**. Browser restored the existing guest session, reached the pending location screen, and confirmed login remains enabled with the DEV warning and no challenge widget. This is not Android sign-off. |
| `pnpm dlx deno check --config supabase\functions\username-login\deno.json supabase\functions\username-login\index.ts` | Passed.                                                                                                                                                                                                                                                                                        |
| `pnpm dlx deno lint supabase\functions\username-login\handler.ts supabase\functions\username-login\index.ts`          | Passed for production source.                                                                                                                                                                                                                                                                  |
| `pnpm dlx deno lint supabase\functions\username-login`                                                                | Failed on pre-existing test mock `require-await`; not a production-source failure, not silently treated as a pass.                                                                                                                                                                             |
| `pnpm format:check` / `git diff --check`                                                                              | Passed after exception; Git warns existing SQL CRLF will normalize to LF.                                                                                                                                                                                                                      |
| `pnpm lint`, `pnpm typecheck`, Expo Doctor                                                                            | Full repo checks passed before DEV exception; Doctor **21/21**. Latest exception received targeted mobile/shared checks above.                                                                                                                                                                 |
| Android full native bundle                                                                                            | HTTP 200, about 13.2 MB before latest exception/UI refinements. Not device sign-off or a final production build.                                                                                                                                                                               |
| Admin/mobile startup                                                                                                  | Both served successfully; admin login returned HTTP 200. Now intentionally stopped for handoff.                                                                                                                                                                                                |
| Protected endpoint live probes                                                                                        | OPTIONS 204, malformed input 400, invalid CAPTCHA 400 before exception.                                                                                                                                                                                                                        |
| Exception endpoint live probe                                                                                         | Tokenless unknown username returned **401 INVALID_CREDENTIALS**. No real-user credentials used.                                                                                                                                                                                                |
| Exception browser guest flow                                                                                          | DEV warning, widget absent, button enabled; Auth signup **200 without token**, pending location, Home and Account guest view; same identity after reload.                                                                                                                                      |
| Browser failure recovery                                                                                              | Transient Supabase DNS failure showed reconnect/retry; retry recovered and subsequent reload passed.                                                                                                                                                                                           |
| Owner protected-mode report                                                                                           | CAPTCHA worked in Chrome and on phone, not VS Code integrated browser. Not a complete Android auth review.                                                                                                                                                                                     |

**Unverified:** real permanent-account signup/confirmation, email/username login, guest conversion/cart preservation, reset, and logout end-to-end on Android. No Android screenshots/recordings/sign-off have been supplied.

## Teammate startup (Windows, no Docker)

After obtaining the complete working-tree changes and approved configuration:

```powershell
git status --short
git branch --show-current
git --no-pager log -3 --oneline
pnpm install --frozen-lockfile
pnpm supabase login
pnpm supabase link --project-ref nzltgmfodazrhrxufpwe
pnpm supabase migration list --linked
```

Use Node 22 as specified by `.nvmrc` and pnpm 12.9.1. Authenticate privately. If linking needs a DB password, the owner enters it in their terminal; never record it.

In separate terminals:

```powershell
pnpm dev:mobile --port 8081
```

```powershell
pnpm dev:admin
```

Start mobile from the repo via its workspace script, **not root-level plain Expo** (previously caused the wrong App entry). Use the newly printed QR/LAN address. This computer used `172.20.10.5`; do not assume that IP on another system. Phone and computer must share a reachable network. Add exact new Expo Go confirmation/conversion/recovery redirects as described in [user flows](user-flows.md#auth-configuration-for-the-android-review).

Do not run `pnpm supabase start` or `pnpm supabase test db --linked`: both attempted Docker here. Use the hosted rollback SQL API command above. Future deployments use `--use-api` and explicit project ref. Do not push migrations or seed data just to resume.

### Known preview limitation

Expo's Node process hit approximately 4 GB heap exhaustion after about 52 minutes. Restarting restored HTTP 200; no heap-limit/config/dependency workaround was added. Investigate separately if it recurs; this is **not resolved**. Do not kill unrelated processes by name. Stop only identified repo process IDs or session shells. SDK package install previously hit file locks; stopping identified dev servers allowed retry.

## Next tasks, in order

1. **Mandatory Android auth checkpoint first.** Collect phone model/Android version and screenshots/recordings for the checklist below. Mark untested items explicitly. Fix actual failures before location implementation. Current tests are CAPTCHA-disabled; restore and retest CAPTCHA separately before release/sign-off.
2. Verify Google APIs/billing/server-only configuration with owner, without retrieving or displaying secrets. Obtain real pincodes/ETAs, or retain explicitly marked development placeholders.
3. Implement typed/rate-limited authenticated `geocode-reverse`, `places-autocomplete`, `places-details`; restrict to India and use Places session tokens. Secrets stay only in Edge Functions.
4. Complete and integrate the retained permission/GPS/manual pincode/address prototypes with Places, address CRUD/defaults, persistent coverage/waitlist state, delivery-header address switcher and gentle unserviceable-cart notice. Review prototype validation/default-address behavior and loading/empty/error/offline states before exposing them as the main onboarding path.
5. **Mandatory second Android checkpoint** for location/address/coverage behavior.
6. Finish docs and all checks, app startup, RLS/secrets review. With owner approval, Conventional Commits with Copilot co-author, push the phase branch and create a PR using the repository template with screenshots. Owner reviews/merges; never merge main yourself. Phase 4 waits for Phase 3 completion/merge.

Approved mobile libraries: WebView, expo-location, expo-linking/expo-secure-store (all present after reconciliation). Use `npx expo install` from mobile; ask before additional libraries.

### Android review feedback to collect

```text
Phone model:
Android version:
CAPTCHA mode: temporary DEV OFF / restored ON
Guest sign-in + fully closing/reopening: PASS / FAIL / NOT TESTED
Guest cart persistence: PASS / FAIL / NOT TESTED
Guest conversion + email link + cart preserved: PASS / FAIL / NOT TESTED
Fresh signup + confirmation: PASS / FAIL / NOT TESTED
Email login / username login: PASS / FAIL / NOT TESTED
Wrong-password error / logout + cart clearing: PASS / FAIL / NOT TESTED
Recovery link + new password works + old password rejected: PASS / FAIL / NOT TESTED
Confirmation resend: PASS / FAIL / NOT TESTED
Keyboard, scrolling, back navigation: PASS / FAIL / NOT TESTED
Offline error + retry after reconnecting: PASS / FAIL / NOT TESTED
Exact failing step and visible error:
Screenshots/recordings (hide personal info, passwords, link tokens):
```

Use an inbox controlled by the tester; open email links on the same phone. Test guest conversion before logging out, with an item in the guest cart. Use a different email/username for fresh signup. Do not assume a successful CAPTCHA or database test means all auth flows passed.
