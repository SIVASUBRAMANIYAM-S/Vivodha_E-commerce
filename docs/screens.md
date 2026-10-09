# Screens inventory

Every mobile and admin screen, with its route, main components, and the four standard states.

**Standard states.** Unless a row says otherwise:

| State       | Mobile pattern                                                                           | Admin pattern                    |
| ----------- | ---------------------------------------------------------------------------------------- | -------------------------------- |
| **Loading** | Skeleton placeholders shaped like the content (no full-screen spinner after first paint) | Table/form skeleton              |
| **Empty**   | Friendly message, an original illustration (TBD), and one primary action                 | "No X yet" + Create button       |
| **Error**   | Inline message + Retry; the error is reported to Sentry                                  | Toast + inline banner with Retry |
| **Offline** | Top banner "You're offline"; cached data stays visible; mutating actions are disabled    | Banner; forms disabled           |

---

## Mobile app (apps/mobile, Expo Router)

### Onboarding: `app/(onboarding)/`

| Screen            | Route                    | Components                                                         | Notes / special states                                                                                                 |
| ----------------- | ------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Splash            | `/splash`                | Wordmark, ActivityIndicator                                        | Waits on auth-store init, then routes: no session → Welcome; session + no pincode → Location; session + pincode → Home |
| Welcome           | `/welcome`               | Brand hero, Button×3 (Create account / Log in / Continue as guest) | Guest → Turnstile, then anonymous sign-in; routes to Location                                                          |
| Location: choice  | `/location`              | Button×2 (Use current location / Enter pincode manually)           | GPS path uses `expo-location`'s on-device geocoder for the pincode (interim — ADR-152); denied/failed → manual entry   |
| Location: search  | `/location/search`       | Input (pincode)                                                    | Calls `check_pincode` directly (no Edge Function needed)                                                               |
| Location: result  | `/location/result`       | Success/unserviceable states, phone Input, NotifyMe Button         | Unserviceable → waitlist signup (phone only), then continues to Home regardless (never blocks browsing — ADR-153)      |
| Location: address | `/location/address-form` | `AddressForm` (shared with Account's future "add address")         | Pincode pre-filled and locked; creates the first `addresses` row                                                       |

### Auth: `app/(auth)/`

| Screen           | Route               | Components                                                                          | Notes                                                                                                                |
| ---------------- | ------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Login            | `/login`            | Input (username or email), PasswordInput, Button, links                             | Generic error copy for wrong password/unknown username/unknown email alike                                           |
| Sign up          | `/signup`           | Inputs: name, username (live availability), email, phone, password + strength meter | If an anonymous session is already active, submits through guest-conversion instead of a fresh signup (same user id) |
| Forgot password  | `/forgot-password`  | EmailInput, Button                                                                  | Same next screen (check-email) regardless of whether the email exists                                                |
| Check email      | `/check-email`      | Confirmation message; Expo-Go-only "Continue" button                                | The Continue button re-attempts login once the link's been opened anywhere — see ADR-150                             |
| Callback         | `/callback`         | ActivityIndicator, ErrorState                                                       | PKCE deep-link target for every email link; exchanges `?code=`, routes by `type` (recovery vs. confirmation)         |
| Set new password | `/set-new-password` | PasswordInput ×2 + strength meter, Button                                           | Only reachable after callback exchanges a `type=recovery` code                                                       |

### Tabs: `app/(tabs)/`

| Screen     | Route         | Components                                                                                                                                                                                                           | Empty / special states                                                                       |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Home       | `/home`       | HomeHeader (logo + "Delivering to <pincode>"), SearchBar (persistent), BannerCarousel, CategoryGrid, ShoppingListEntry (write/photo/upload), ProductRail×4 (Deals, Best sellers, Top picks for you, Recently viewed) | Sections render from `home_sections`. Empty rails are hidden. Unserviceable pincode → banner |
| Categories | `/categories` | CategoryTree / grid, SubcategoryList                                                                                                                                                                                 | No categories → error (config problem)                                                       |
| Search     | `/search`     | SearchInput (autofocus), RecentSearches, Suggestions, ProductGrid                                                                                                                                                    | No results → suggestions + "Try Shopping List"                                               |
| Cart       | `/cart`       | CartItemRow (stepper), SavingsSummary, CouponEntry, FreeDeliveryNudge, VivoPointsToggle, StickyCartBar                                                                                                               | Empty cart → "Your cart is empty" + Start shopping. Item out of stock → inline warning       |
| Account    | `/account`    | ProfileHeader, PointsBalanceCard, menu (Orders, Addresses, Shopping lists, Wishlist, Notifications, Help, Policies, Delete account, Log out)                                                                         | Guest → "Create account" CTA and order lookup                                                |

### Stack screens

| Screen           | Route                 | Components                                                                                                                                  | Notes                                                                                                                                 |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Category listing | `/category/[slug]`    | Animated subcategory tabs, FlashList product grid, brand/price/discount filter sheet, sort sheet, ProductCard                               | Client-side filters return no match → "Clear filters"; loading, error, empty, offline and pull-to-refresh states                      |
| Product detail   | `/product/[id]`       | Swipeable image gallery, category/brand/title, generic variant selector, PriceTag, local-cart AddStepper, optional description, SimilarRail | Missing product → not-found empty state; catalog loading/error/offline states; card-to-detail uses fast fade with a subtle hero scale |
| Checkout         | `/checkout`           | Stepper: AddressStep, DeliveryTypeStep, PaymentStep, ReviewSummary, PlaceOrderButton                                                        | Guest contact form. Price changed → re-confirm dialog                                                                                 |
| Payment result   | `/checkout/result`    | Success / Failure / Pending panels                                                                                                          | See user-flows: payment outcomes                                                                                                      |
| Orders           | `/orders`             | OrderList (status chips), OrderLookup (guest)                                                                                               | Empty → "No orders yet"                                                                                                               |
| Order detail     | `/orders/[id]`        | StatusTimeline, ItemsList, PriceBreakdown, Invoice download, Cancel/Return/Reorder buttons, RatingPrompt, PointsEarned                      | Realtime status updates                                                                                                               |
| Return request   | `/orders/[id]/return` | ItemPicker, ReasonSelect, PhotoUpload, RefundMethod                                                                                         | Outside window → disabled with explanation                                                                                            |
| Shopping list    | `/shopping-list`      | ModeTabs (Write / Photo / Upload), TextArea, CameraCapture, FilePicker, ParsedItemsList (match + confirm), AddAllToCart                     | Parsing → progress state. Nothing matched → manual search per line                                                                    |
| Addresses        | `/account/addresses`  | AddressList, AddressForm (map pin later)                                                                                                    | Empty → Add address                                                                                                                   |
| Vivo Points      | `/account/points`     | Balance, PendingPoints, LedgerList, ExpiryNotice, HowItWorks                                                                                | Empty ledger → explainer                                                                                                              |
| Account deletion | `/account/delete`     | Explanation, Confirm (re-auth), status                                                                                                      | Required by Google Play                                                                                                               |
| Policy pages     | `/legal/[slug]`       | Markdown/HTML from CMS or config                                                                                                            | privacy, terms, shipping, refund-return                                                                                               |

> Phase 0 created placeholders for: splash, welcome, location, login, signup, forgot-password, the 5 tabs, product/[id], category/[slug], checkout, orders, shopping-list. The other screens are added in their feature phases.

---

## Admin panel (apps/admin, Next.js App Router)

| Screen      | Route                           | Components                                                                                                                               | Notes                               |
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Login       | `/login`                        | Logo, email + password form                                                                                                              | Non-admin user → "No admin access"  |
| Dashboard   | `/dashboard`                    | KPI cards (today's orders, revenue, AOV), Orders-to-pack list, LowStock list, PendingReturns                                             | Phase 8                             |
| Products    | `/products`, `/products/[id]`   | DataTable (search, filters, bulk actions), ProductForm (attribute set, options, variants matrix, images, SEO, Vivo price, GST rate, HSN) | Draft / published states            |
| Categories  | `/categories`                   | Tree editor (drag order), CategoryForm (image, booster)                                                                                  |                                     |
| Brands      | `/brands`                       | DataTable, BrandForm                                                                                                                     |                                     |
| Inventory   | `/inventory`                    | DataTable per variant × seller, inline stock edit, low-stock threshold                                                                   | CSV import (later)                  |
| Orders      | `/orders`, `/orders/[id]`       | Queue by status, OrderDetail, status actions, AWB entry (courier), refund action, invoice                                                | Realtime new-order badge            |
| Customers   | `/customers`, `/customers/[id]` | DataTable, CustomerDetail (orders, addresses, points, notes)                                                                             | Masked PII for the support role     |
| Banners     | `/banners`                      | BannerList (schedule, target), BannerForm (image upload, deep link)                                                                      | Home sections editor lives here too |
| Coupons     | `/coupons`                      | DataTable, CouponForm (type, value, min order, limits, validity)                                                                         |                                     |
| Pincodes    | `/pincodes`                     | DataTable, bulk import, PincodeForm (mode, fee, free threshold, ETA, COD allowed)                                                        | Notify-me requests count            |
| Vivo Points | `/points`                       | Rules form (store_config.points), Ledger search, Manual adjustment (reason required)                                                     |                                     |
| Settings    | `/settings`                     | Store config (logo, theme, home layout, business numbers), Feature flags, Admin users & roles                                            | Owner-only                          |
