# Design language: "Fresh Futurism"

The mobile app's visual and interaction language. Tokens live in [`packages/shared/src/tokens/`](../packages/shared/src/tokens/); [design-tokens.md](design-tokens.md) is the token reference. Decisions: ADR-133..141 in [decisions.md](decisions.md).

## 1. Principles

1. **Clean, bright, premium, fast.** Light surfaces (white and tint `#E3F4EC`), generous rounded corners, soft layered depth. Nothing heavy.
2. **Futuristic means motion and touch, not decoration.** Fluid, physics-based motion and instant tactile feedback. No glows, no neon, no gratuitous gradients.
3. **Every animation communicates state** — added, loading, progress, success. If an animation doesn't tell the user something, it doesn't ship.
4. **Nothing waits on an animation.** No constant ambient motion; no animation blocks input or delays navigation. Taps register instantly; motion follows.
5. **Emerald gradient is for hero moments only** (banners, the success screen, the cart bar). Everything else is flat colour on light surfaces.

## 2. Colour

### Rules (enforced by review, see `docs/design-tokens.md`)

| Colour                    | Allowed use                                                          | Never                                               |
| ------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| Emerald `primary #0B7A55` | Primary actions, active states, links, progress, success             | Large flat backgrounds (use tint)                   |
| Tint `#E3F4EC`            | Soft surfaces, selected chips, info cards, skeleton base             | Text                                                |
| Saffron `#FF9F1C`         | **Background or badge fill only, always with ink text**              | Text colour; white text on saffron (2.05:1, fails)  |
| Offer red                 | **Discounts only**: % OFF badge, struck-through savings, deal timers | Errors-as-decoration, prices, anything non-discount |
| Points purple `#6B4BC4`   | **Vivo Points / loyalty only**                                       | Anything not loyalty                                |
| Ink `#13261F`             | Primary text                                                         | —                                                   |

### Accessible variants (WCAG AA = 4.5:1 for normal text, 3:1 for large text ≥ 18.66px bold / 24px)

Measured, not guessed — `pnpm --filter @vivodha/shared contrast` recomputes this table from the tokens and fails if a required pair drops below AA.

| Pair                                             | Ratio         | Verdict | Action                                                                                     |
| ------------------------------------------------ | ------------- | ------- | ------------------------------------------------------------------------------------------ |
| Ink on white / on tint                           | 15.85 / 13.90 | ✅      | —                                                                                          |
| Primary on white / on tint                       | 5.34 / 4.69   | ✅      | —                                                                                          |
| White on primary                                 | 5.34          | ✅      | —                                                                                          |
| Points on white / white on points                | 6.12          | ✅      | —                                                                                          |
| Ink on saffron                                   | 7.72          | ✅      | Saffron badges always use ink text                                                         |
| White on saffron / saffron on white              | 2.05          | ❌      | Forbidden. Saffron-coloured text uses **`saffronText #9A5800`** (5.57 / 4.89 on tint)      |
| Brand offer `#E5484D` on white / white on it     | 3.91          | ❌      | Discount text **and** % OFF badge fill use **`offerStrong #C42F35`** (5.52 / 4.84 on tint) |
| Phase 0 secondary grey `#6B7B75` on white / tint | 4.45 / 3.91   | ❌      | Replaced by **`textSecondary #5A6963`** (5.78 / 5.07)                                      |
| Disabled grey `#94A39D` on white                 | 2.63          | n/a     | WCAG exempts disabled controls; never used for informative text                            |

### Semantic tokens

Components never reference brand hex values; they read semantic tokens from `useTheme()`:

`surface`, `surfaceElevated`, `surfaceMuted`, `surfaceTint`, `textPrimary`, `textSecondary`, `textDisabled`, `textOnPrimary`, `textOnAccent`, `border`, `borderStrong`, `primary`, `primaryPressed`, `success`, `warning` (fill) / `warningText`, `danger`, `discount` / `discountSoft`, `points` / `pointsSoft`, `overlay`, `shadow`.

Only `light` exists today. Dark mode = add a `dark` token set with the same keys and switch it in `ThemeProvider`; no component changes.

## 3. Typography

Poppins for headings, prices and counters; Inter for body. Every numeric variant uses `fontVariant: ['tabular-nums']` so digits keep a fixed width; rolling counters additionally render each digit in a fixed-width cell, so nothing jitters even if a font lacks the `tnum` feature.

| Variant      | Family  | Size / line | Weight   | Numeric |
| ------------ | ------- | ----------- | -------- | ------- |
| `display`    | Poppins | 28 / 34     | bold     |         |
| `h1`         | Poppins | 22 / 28     | semibold |         |
| `h2`         | Poppins | 18 / 24     | semibold |         |
| `h3`         | Poppins | 16 / 22     | semibold |         |
| `bodyLarge`  | Inter   | 16 / 24     | regular  |         |
| `body`       | Inter   | 14 / 20     | regular  |         |
| `bodyStrong` | Inter   | 14 / 20     | semibold |         |
| `label`      | Inter   | 14 / 18     | semibold |         |
| `small`      | Inter   | 12 / 16     | regular  |         |
| `caption`    | Inter   | 11 / 14     | medium   |         |
| `priceLarge` | Poppins | 22 / 28     | bold     | ✅      |
| `price`      | Poppins | 16 / 20     | bold     | ✅      |
| `priceSmall` | Poppins | 13 / 16     | semibold | ✅      |
| `mrp`        | Inter   | 12 / 16     | regular  | ✅      |
| `counter`    | Poppins | 14 / 18     | semibold | ✅      |

Text scales with the system font size (`allowFontScaling`), capped at `maxFontSizeMultiplier = 1.6` so dense commerce layouts stay usable.

## 4. Shape and depth

| Token                                            | Value | Use                              |
| ------------------------------------------------ | ----- | -------------------------------- |
| `radius.card`                                    | 20    | Cards, product tiles, banners    |
| `radius.button` / `radius.chip` / `radius.input` | 14    | Buttons, chips, inputs, steppers |
| `radius.image`                                   | 14    | Images inside cards              |
| `radius.badge`                                   | 8     | Small badges                     |
| `radius.sheet`                                   | 28    | Bottom sheets (top corners)      |
| `radius.pill`                                    | 999   | Pills, page indicators           |

**Depth is soft and layered**: two stacked low-opacity shadows (ink-tinted, never black) rendered with React Native's `boxShadow` (consistent on Android and iOS under the new architecture). Three levels: `sm` (cards at rest), `md` (raised/pressed-out surfaces, floating search), `lg` (cart bar, sheets, toasts). This supersedes Phase 0's "flat, borders only" rule (ADR-133).

Touch targets are at least **48 × 48 dp** (`touch.min`), using `hitSlop` where the visual is smaller.

## 5. Motion

All animation runs on the **UI thread** (Reanimated worklets / shared values). No `setInterval`/`requestAnimationFrame` loops on the JS thread.

| Token               | Value                               | Use                                         |
| ------------------- | ----------------------------------- | ------------------------------------------- |
| `duration.instant`  | 100 ms                              | Press feedback, colour changes              |
| `duration.fast`     | 160 ms                              | Fades, small toggles, digit roll            |
| `duration.base`     | 240 ms                              | Most transitions, sheet content, toasts     |
| `duration.slow`     | 380 ms                              | Large moves: fly-to-cart, success checkmark |
| `spring.snappy`     | damping 18, stiffness 320, mass 0.8 | Buttons, stepper morph, indicators          |
| `spring.gentle`     | damping 20, stiffness 160, mass 1   | Cart bar, sheets, header collapse           |
| `spring.bouncy`     | damping 11, stiffness 260, mass 0.9 | Badge count bounce, arrival pulse           |
| `easing.standard`   | cubic-bezier(0.2, 0, 0, 1)          | Default                                     |
| `easing.decelerate` | cubic-bezier(0, 0, 0.2, 1)          | Entrances                                   |
| `easing.accelerate` | cubic-bezier(0.3, 0, 1, 1)          | Exits                                       |
| `stagger`           | 40 ms per item, capped at 8 items   | First-load entrances only                   |

**Reduced motion** (`useReducedMotion()`, follows the OS setting): every movement (translate/scale/arc) becomes a short opacity fade; springs become `duration.fast` timings; the fly-to-cart arc is skipped (the cart badge still bounces in place as a fade); shimmer becomes a static skeleton; the celebratory burst becomes a single fade.

## 6. Haptics

| Event                                      | Haptic                                   |
| ------------------------------------------ | ---------------------------------------- |
| Add to cart, increment, decrement          | `impactLight`                            |
| Tab change, chip / filter / variant change | `selection`                              |
| Order-level win (free delivery reached)    | `notificationSuccess` (once per session) |
| Failure (out of stock, network error)      | `notificationError`                      |

Haptics fire on the input, never on an animation's completion, so the feedback is instant.

## 7. Signature interactions

| #   | Interaction                                 | What it communicates          | Implementation notes                                                                                                              |
| --- | ------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Add → stepper morph, rolling digits         | Item is in the cart; quantity | Width/colour spring (`snappy`); digits are fixed-width cells sliding vertically                                                   |
| 2   | Fly-to-cart                                 | Where the item went           | Thumbnail on a quadratic Bézier from the card to the cart tab/bar (`slow`), arrival pulse (`bouncy`); first add of a product only |
| 3   | CartBar spring-up, count-up, hide on scroll | Cart has items; total         | Springs up on the first item; hides on scroll down, returns on scroll up                                                          |
| 4   | FreeDeliveryProgress + burst                | Progress to a reward          | Bar width spring; burst + success haptic once per session at the threshold                                                        |
| 5   | Collapsing home header                      | Context + persistent search   | Logo row shrinks/fades with scroll; search pins; blur fades in only after scrolling                                               |
| 6   | Banner carousel                             | More banners; position        | Snap paging, image parallax, autoplay pauses while touched, morphing pill indicator                                               |
| 7   | Card → detail transition                    | Continuity                    | Scale+fade (shared-element transitions aren't available in Expo Go, ADR-138)                                                      |
| 8   | Skeleton shimmer                            | Loading, and the final layout | Skeletons match real layout dimensions so nothing jumps                                                                           |
| 9   | Staggered fade-up                           | Content arrived               | First load only, capped at 8 items                                                                                                |
| 10  | Pull-to-refresh leaf                        | Refreshing                    | See `docs/screens.md` for the fallback used                                                                                       |
| 11  | Success checkmark                           | Done                          | SVG stroke drawn with `strokeDashoffset`; used later for order confirmation                                                       |
| 12  | Points badge shimmer                        | Balance changed               | One-time purple sheen when the value changes                                                                                      |

## 8. Performance budget

- **60 fps** scrolling on Home and the category grid on a mid-range Android phone.
- **FlashList** for every list and grid; items are `memo`'d with stable keys; no heavy computation in render (derive data in `select` of the query or `useMemo`).
- **expo-image** everywhere: memory+disk caching, a tint placeholder, `recyclingKey` for FlashList cells, and source images sized for their display (seed images are 512 px WebP, ~8 KB).
- **No blur inside scrolling lists** — blur only on the header (after scroll) and sheet backdrops. **No layout animations on large lists.**
- **Lean cold start**: the Design Lab is `__DEV__`-only and required lazily, so it never ships in a production bundle; fonts load during the splash screen.

### How to profile

1. **Frame rate:** shake the device (or press `m` in the Expo terminal) → open the dev menu → **Toggle Performance Monitor**. Watch both **UI** and **JS** FPS while scrolling Home and the category grid; both should stay near 60. A JS-thread drop during an animation means something is animating on the wrong thread.
2. **Renders:** press `j` in the Expo terminal to open **React Native DevTools** → **Profiler** tab → record while scrolling or tapping Add. Look for list items re-rendering on unrelated state changes (fix with `memo`, stable callbacks, or narrower Zustand selectors).
3. **Real-device check:** always profile on a mid-range Android device in Expo Go, not the emulator; the emulator's numbers are unrepresentative.
4. **Production-like:** Expo Go runs a development bundle (slower). For a production-mode check, run `npx expo start --no-dev --minify` and open it in Expo Go.
