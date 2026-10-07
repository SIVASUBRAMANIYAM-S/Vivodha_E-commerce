## Summary

<!-- What does this PR do and why? Link to the relevant docs/phases.md row. -->

## Phase

<!-- e.g. Phase 1: supabase-schema (branch phase-1-supabase-schema) -->

## Changes

-

## How to verify

1.

## Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm format:check` passes
- [ ] Both apps start (`pnpm dev:mobile`, `pnpm dev:admin`)
- [ ] RLS reviewed: every new/changed table has RLS enabled + policies (+ tests)
- [ ] Generated Supabase types updated (`pnpm db:types`) if the schema changed
- [ ] No secrets in the diff (`git diff --cached` reviewed; no `.env`, keys, or passwords)
- [ ] No competitor assets (names, logos, colours, icons, illustrations, copy)
- [ ] Loading / empty / error / offline states handled for new screens
- [ ] Docs updated (PRD, screens, data-model, decisions, open-questions as relevant)

## Screenshots

<!-- Mobile and admin screenshots for any UI change. -->

## Open questions

<!-- Anything that needs an owner decision (also add it to docs/open-questions.md). -->
