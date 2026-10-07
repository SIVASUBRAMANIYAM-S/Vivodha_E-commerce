# Copilot instructions: Vivodha

Condensed from [CLAUDE.md](../CLAUDE.md), which is the full source of truth.

- **Product:** Vivodha, a multi-category e-commerce store for India (INR, GST). Expo React Native app (Android first) + Next.js admin. Supabase backend. Single seller now, marketplace later (`seller_id` everywhere). Re-skinnable via `store_config`, `feature_flags`, and generic `attribute_sets`. Never assume weight is the only variant type.
- **Stack:** pnpm + Turborepo, Node 22, TypeScript ~6.0, ESLint 9. Mobile: Expo SDK 57, Expo Router (`apps/mobile/app/`), TanStack Query, Zustand. Admin: Next.js 16 App Router (`src/proxy.ts`, not middleware.ts), Tailwind v4, shadcn/ui, `@supabase/ssr`. Shared: `@vivodha/shared` (tokens, constants, zod schemas, generated DB types).
- **Security:** never commit secrets. The client env files (`apps/mobile/.env`, `apps/admin/.env.local`) are committed and may hold only the Supabase URL + publishable key. Service-role, Razorpay, and AI keys live only in Edge Functions. Never write the DB password anywhere. RLS on every table. Never trust client-side prices, stock, coupons, or points.
- **Design:** UX patterns only. Never use competitor names, logos, colours, icons, illustrations, banners, copy, or pixel-identical screens. Use tokens from `@vivodha/shared/tokens` (no hex in components). Poppins headings, Inter body. Flat elevation. Lucide icons. Saffron = sparing highlights, offer red = discounts only, points purple = loyalty only.
- **Code:** use generated Supabase types (`pnpm db:types`). Validate with shared zod schemas. Money is integer paise (`formatINR`). Business numbers come from `store_config`. Add Expo packages with `npx expo install`. Every screen handles loading, empty, error, and offline states.
- **Git:** branch `phase-<N>-<name>` from an up-to-date default branch, after verifying the previous phase branch is merged. Conventional Commits. Never push to or merge into `main`. Never force-push. Open a PR with the template.
- **Process:** plan before coding, one feature per session. Ask when unclear and record it in `docs/open-questions.md`. Record decisions in `docs/decisions.md`.
- **Done:** lint + typecheck + format pass, both apps start, RLS reviewed, no secrets in the diff, docs updated, PR with screenshots.
