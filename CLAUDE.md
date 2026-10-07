# CLAUDE.md: Vivodha

Rules for AI assistants (and humans) working in this repo. Read this file fully before any change.

## Product

**Vivodha** ("Fresh to your door") is a multi-category online store for India (INR, GST): food & grocery, fruits & vegetables, dairy & bakery, beverages, home care, personal care & beauty, home & kitchen, lifestyle.

- Deliverables: **React Native mobile app** (Android first, iOS later, same codebase) and **web admin panel**.
- **Single seller now, marketplace later:** every product / variant / inventory / order record carries `seller_id`.
- **Re-skinnable:** `store_config` (logo, theme, features, home layout), `feature_flags`, generic `attribute_sets` (grocery = weight/pack size, fashion = size/colour). **Never hardcode weight as the only variant type.**
- Guests can browse **and** order (Supabase anonymous sign-in). Auth = username **or** email + password (no OTP).
- Vivo Points loyalty: append-only `points_ledger`, and all numbers in config.
- Specs: [docs/PRD.md](docs/PRD.md), [docs/screens.md](docs/screens.md), [docs/user-flows.md](docs/user-flows.md), [docs/data-model.md](docs/data-model.md), [docs/rls-policies.md](docs/rls-policies.md), [docs/edge-functions.md](docs/edge-functions.md), [docs/phases.md](docs/phases.md), [docs/decisions.md](docs/decisions.md), [docs/compliance.md](docs/compliance.md), [docs/open-questions.md](docs/open-questions.md).

## Stack

| Area             | Tech                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Monorepo         | pnpm workspaces (`nodeLinker: hoisted`) + Turborepo, Node 22 (`.nvmrc`)                                                |
| Mobile           | Expo SDK 57, TypeScript, Expo Router, TanStack Query, Zustand, `@supabase/supabase-js` + expo-secure-store             |
| Admin            | Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui (Base UI, Lucide), `@supabase/ssr`                           |
| Shared           | `@vivodha/shared` (tokens, constants, zod schemas, generated DB types), `@vivodha/config` (tsconfig, ESLint, Prettier) |
| Backend          | Supabase: Postgres, Auth (incl. anonymous), Storage, Edge Functions, Realtime                                          |
| Later            | Razorpay, Resend SMTP, Google Maps/Places, Expo Notifications/FCM, Sentry, Firebase Analytics, EAS Build               |
| Tooling versions | TypeScript ~6.0, ESLint 9, Prettier 3                                                                                  |

> Expo and Next.js change fast. Before writing Expo/RN code, read [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md). Before writing Next.js code, read [apps/admin/AGENTS.md](apps/admin/AGENTS.md) and the bundled docs in `node_modules/next/dist/docs/`. Next 16 uses **`src/proxy.ts`**, not `middleware.ts`.

## Folder structure

```
apps/
  mobile/                 Expo app
    app/                  Expo Router routes ONLY: (onboarding) (auth) (tabs) product/[id] category/[slug] checkout orders shopping-list
    src/components/ui/    Base components (Text, Button, Input, Screen…)
    src/components/product/ ProductCard, AddStepper
    src/features/<feature>/{api,hooks,components,store}/   auth, catalog, cart, checkout, orders, points, shopping-list
    src/lib/              supabase.ts, secure-storage.ts, query-client.ts
    src/theme/            Re-exports @vivodha/shared tokens + font mapping
    src/store/ src/utils/ assets/
  admin/                  Next.js app
    src/app/(auth)/login/ src/app/(dashboard)/<section>/
    src/components/ui/    shadcn (generated; don't hand-edit unless needed)
    src/components/{brand,layout}/
    src/features/<feature>/
    src/lib/supabase/     client.ts, server.ts, middleware.ts (updateSession), env.ts
    src/proxy.ts          Session refresh (Next 16 "middleware")
packages/
  shared/src/             tokens/ constants/ schemas/ types/database.ts (generated)
  config/                 tsconfig/ eslint/ prettier/
supabase/                 config.toml, migrations/, functions/, seed.sql
docs/                     Product & engineering docs
```

## Naming conventions

- Files: React components `PascalCase.tsx` in mobile (`ProductCard.tsx`); admin follows the shadcn convention `kebab-case.tsx`. Hooks are `useThing.ts`. Other modules are `kebab-case.ts`.
- Routes: lowercase kebab-case segments. Dynamic segments `[id]`, `[slug]`. Route groups `(name)`.
- DB: `snake_case`, plural tables, `*_id` foreign keys, `*_paise` money (bigint), `*_at` timestamps, enums in `snake_case`.
- TS: `camelCase` variables/functions, `PascalCase` types/components, `SCREAMING_SNAKE_CASE` constants.
- Packages: `@vivodha/<name>`.
- Branches: `phase-<N>-<short-name>`. Commits: **Conventional Commits** (`feat(mobile): …`, `fix(admin): …`, `chore: …`, `docs: …`).
- Edge Functions: `kebab-case` folder names (`place-order`).

## Git workflow (mandatory every phase)

**Before starting ANY phase:**

1. `git fetch --all --prune`
2. Detect the default branch (`main` or `master`) with `git remote show origin`. Call it `<default>`.
3. The working tree must be clean. Otherwise **STOP and report**.
4. If a previous phase branch (`phase-<N>-*`) exists, verify it is merged into `origin/<default>`. If it is NOT merged, **STOP**, report which branch, and do nothing else.
5. `git checkout <default>` && `git pull`
6. Create `phase-<N>-<short-name>`.

**During a phase:** small Conventional Commits. Never commit secrets (the committed client env files hold only the URL + publishable key; see Security rules). **Never push to or merge into `<default>`. Never force-push.**

**End of phase:** push the branch and open a PR with `gh pr create` using [.github/pull_request_template.md](.github/pull_request_template.md). The owner reviews and merges. Then post a summary, verification steps, and open questions.

## Security rules

- **No secrets in code or git.** The client env files `apps/mobile/.env` and `apps/admin/.env.local` **are committed** (owner decision, ADR-122) so the whole team shares one config. They may contain **only** the Supabase URL and publishable key, never secret/service-role keys, Razorpay/AI secrets, or the DB password. The repo is public, so treat everything committed as public.
- Clients use only the **publishable key** (`EXPO_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`).
- **Secret / service-role keys, Razorpay secrets, and AI model keys live only in Edge Function secrets** (`supabase secrets set`). Never in `apps/*`.
- **The database password is never written anywhere**: not in files, scripts, docs, or chat. Commands that need it are run by the owner in their own terminal.
- **RLS on every table.** No table ships without policies plus tests ([docs/rls-policies.md](docs/rls-policies.md)).
- Never trust client prices, stock, coupons, or points. Edge Functions recompute them.
- Before every commit: review `git diff --cached` for secrets.

## Product & design rules

- **UX patterns only. Never competitor assets.** No competitor names, logos, colours, icons, illustrations, banner artwork, copy text, or pixel-identical screens.
- **Use design tokens** from `@vivodha/shared/tokens`. Never hardcode hex values in components. Saffron is for sparing highlights, offer red for discounts only, points purple for loyalty only.
- Fonts: Poppins (headings), Inter (body). Flat elevation (borders, not shadows). Lucide line icons.
- Every screen handles **loading, empty, error, and offline** states ([docs/screens.md](docs/screens.md)).
- Money is integer paise. Format with `formatINR`.

## Code rules

- **Use generated Supabase types** (`Database` from `@vivodha/shared/types`). Regenerate with `pnpm db:types` after every migration. Never hand-write table types.
- Validate inputs with zod schemas from `@vivodha/shared/schemas`. Share them between the apps and Edge Functions where possible.
- Mobile: server state in TanStack Query, client/UI state in Zustand. No server data in Zustand.
- Admin: Server Components by default. `createClient()` from `@/lib/supabase/server` per request.
- Business numbers (points, fees, limits) come from `store_config`. Constants in `@vivodha/shared` are fallback defaults only.
- Add Expo packages with `npx expo install <pkg>` (from `apps/mobile`) so versions match the SDK.

## How to work

- **Plan before coding. One feature per session.** Show the plan, wait for approval, then implement.
- If anything is unclear or conflicts, **ask**, and record it in [docs/open-questions.md](docs/open-questions.md).
- Record new decisions as ADRs in [docs/decisions.md](docs/decisions.md).

## Commands

```bash
pnpm install          # install everything
pnpm dev:mobile       # Expo dev server (apps/mobile)
pnpm dev:admin        # Next.js dev server on http://localhost:3000
pnpm lint             # ESLint (all workspaces, via turbo)
pnpm typecheck        # tsc (all workspaces, via turbo)
pnpm format           # Prettier write
pnpm supabase <cmd>   # Supabase CLI (e.g. migration list)
pnpm db:types         # regenerate packages/shared/src/types/database.ts (needs linked project)
```

## Definition of done

- [ ] Meets the acceptance criteria in the PRD / phase scope
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm format:check` pass
- [ ] Both apps start (`pnpm dev:mobile`, `pnpm dev:admin`) without errors
- [ ] New/changed tables have RLS policies + tests. Generated types are updated
- [ ] Loading / empty / error / offline states are handled for new screens
- [ ] No secrets in the diff (committed env files contain only the URL + publishable key). Env changes are reflected in `.env.example`
- [ ] Docs updated (PRD/screens/data-model/decisions/open-questions as relevant)
- [ ] PR opened from the phase branch with the template filled in, including screenshots for UI
