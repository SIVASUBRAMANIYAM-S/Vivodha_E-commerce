# Design tokens

Source of truth: [`packages/shared/src/tokens/`](../packages/shared/src/tokens/). Mobile consumes them through `apps/mobile/src/theme`. Admin consumes them as `--brand-*` CSS variables injected in `apps/admin/src/app/layout.tsx` and mapped to shadcn variables in `globals.css`. **Never hardcode hex values in components.**

## Brand

- **Logo:** rounded-square emerald mark, white "V" made of two leaves, saffron seed dot. Lowercase wordmark **vivodha**.
- **Tagline:** "Fresh to your door".
- The current mark in `apps/admin/src/components/brand/logo.tsx` and `app/icon.svg` is a **placeholder**. Final artwork is TBD - owner decision.

## Colour

| Token            | Hex       | Use                                                                      |
| ---------------- | --------- | ------------------------------------------------------------------------ |
| `primary`        | `#0B7A55` | Primary actions, active states, header, links                            |
| `primaryPressed` | `#08603F` | Pressed / hover state of primary                                         |
| `tint`           | `#E3F4EC` | Soft backgrounds, selected chips, info cards                             |
| `saffron`        | `#FF9F1C` | **Sparing highlights only** (badges like "New", seed dot)                |
| `offer`          | `#E5484D` | **Discounts only** (% OFF badges, deal timers). Also `danger` for errors |
| `points`         | `#6B4BC4` | **Vivo Points / loyalty only**                                           |
| `ink`            | `#13261F` | Primary text                                                             |

Neutral scale (ink-tinted): `0 #FFFFFF`, `50 #F7F9F8`, `100 #EEF2F0`, `200 #DDE4E1`, `300 #C3CDC9`, `400 #94A39D`, `500 #6B7B75`, `600 #4E5D57`, `700 #36443F`, `800 #22312B`, `900 #13261F`.

Semantic aliases: `background`, `surface`, `surfaceMuted`, `border`, `text`, `textSecondary`, `textDisabled`, `textOnPrimary`, `success`, `warning`, `danger`.

**Contrast:** white on `primary` passes WCAG AA for normal text. White on `saffron` does **not**, so saffron badges use `ink` text. `offer` with white text is for ≥ 12 px bold badges only.

## Typography

| Variant      | Family  | Size / line | Weight   |
| ------------ | ------- | ----------- | -------- |
| `display`    | Poppins | 28 / 36     | bold     |
| `h1`         | Poppins | 22 / 30     | semibold |
| `h2`         | Poppins | 18 / 26     | semibold |
| `h3`         | Poppins | 16 / 22     | semibold |
| `body`       | Inter   | 14 / 20     | regular  |
| `bodyStrong` | Inter   | 14 / 20     | semibold |
| `small`      | Inter   | 12 / 16     | regular  |
| `caption`    | Inter   | 11 / 14     | medium   |
| `price`      | Inter   | 15 / 20     | bold     |

Mobile loads the fonts through `@expo-google-fonts/*` (the family name encodes the weight). Admin loads them through `next/font/google` (`--font-sans` = Inter, `--font-heading` = Poppins).

## Spacing (4-pt)

`none 0 · xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48`. Screen gutter = `lg` (16).

## Radii

`none 0 · sm 6 · md 10 · lg 14 · xl 20 · pill 999`. Cards `md`, buttons `md`, chips `pill`, sheets `xl` (top corners).

## Elevation: flat

Surfaces are separated by **1 px `border` + background tint, not shadows**. The only exception is `overlay` (bottom sheets, the sticky cart bar), which may use a soft shadow (`ink` @ 8%, radius 12, y −2).

## Icon rule

- One open-source **line** icon set across both apps: **Lucide** (`lucide-react` in admin, already installed; `lucide-react-native` + `react-native-svg` in mobile, added in Phase 3).
- Stroke 1.75-2 px, sizes `sm 16 · md 20 · lg 24`, colour from text tokens.
- **Never** use icons, illustrations, or artwork from competitor apps. Illustrations for empty states are original or properly licensed (TBD - owner decision on the source).

## Component inventory

| Component                                                       | Mobile                       | Admin                      | Phase |
| --------------------------------------------------------------- | ---------------------------- | -------------------------- | ----- |
| Text (variants)                                                 | `ui/Text` (stub)             | Tailwind classes           | 0 / 3 |
| Button (primary, secondary, ghost, destructive; sizes; loading) | `ui/Button` (stub)           | shadcn `button`            | 0 / 3 |
| Input, PasswordInput, PincodeInput, OTP-free forms              | `ui/Input` (stub)            | shadcn `input`, `label`    | 0 / 3 |
| Screen / layout                                                 | `ui/Screen`                  | Dashboard layout + Sidebar | 0     |
| Card                                                            | (3)                          | shadcn `card`              | 0 / 3 |
| ProductCard                                                     | `product/ProductCard` (stub) | -                          | 0 / 5 |
| AddStepper                                                      | `product/AddStepper` (stub)  | -                          | 0 / 6 |
| Badge (offer %, new, points)                                    | 3                            | 2                          | 3     |
| Chip / FilterChip                                               | 3                            | -                          | 3     |
| BottomSheet (sort, filters, variant)                            | 3                            | -                          | 3     |
| BannerCarousel                                                  | 5                            | -                          | 5     |
| ProductRail                                                     | 5                            | -                          | 5     |
| StickyCartBar                                                   | 6                            | -                          | 6     |
| StatusTimeline                                                  | 7                            | 8                          | 7     |
| Toast / Snackbar                                                | 3                            | shadcn `sonner`            | 2 / 3 |
| Skeleton                                                        | 3                            | shadcn `skeleton`          | 2 / 3 |
| EmptyState / ErrorState / OfflineBanner                         | 3                            | 2                          | 3     |
| DataTable                                                       | -                            | shadcn + TanStack Table    | 2     |
| Dialog / ConfirmDialog                                          | 3                            | shadcn `dialog`            | 2 / 3 |
