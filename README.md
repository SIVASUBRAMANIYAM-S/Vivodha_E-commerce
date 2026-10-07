# vivodha

Fresh to your door. A multi-category online store for India: Expo React Native app (Android first) + Next.js admin panel on Supabase.

## Requirements

- Node **22** (`.nvmrc`), pnpm **12**, Git, GitHub CLI (`gh`) for PRs
- Android: Expo Go or an emulator/device for development builds

## Setup

```bash
pnpm install
cp apps/mobile/.env.example apps/mobile/.env          # fill in Supabase URL + publishable key
cp apps/admin/.env.example apps/admin/.env.local      # same values, NEXT_PUBLIC_ prefix
```

Only the **publishable** key goes in these files. Secret/service-role keys are never used in the apps.

Link Supabase (owner only, run in your own terminal; the DB password is entered at the prompt and never stored):

```bash
pnpm supabase login
pnpm supabase link --project-ref <project-ref>
```

## Commands

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `pnpm dev:mobile` | Start the Expo dev server                        |
| `pnpm dev:admin`  | Start the admin on http://localhost:3000         |
| `pnpm dev`        | Run all dev servers through Turborepo            |
| `pnpm lint`       | ESLint across workspaces                         |
| `pnpm typecheck`  | TypeScript across workspaces                     |
| `pnpm format`     | Prettier                                         |
| `pnpm db:types`   | Regenerate Supabase types into `packages/shared` |

## Structure

```
apps/mobile     Expo app (Expo Router routes in app/, code in src/)
apps/admin      Next.js admin (App Router, shadcn/ui)
packages/shared Design tokens, constants, zod schemas, DB types
packages/config Shared tsconfig, ESLint, Prettier
supabase/       Supabase CLI project (migrations, functions, seed)
docs/           PRD, screens, flows, data model, RLS, edge functions, phases, decisions, compliance
```

Contributor and AI-assistant rules: [CLAUDE.md](CLAUDE.md). Delivery plan: [docs/phases.md](docs/phases.md).
