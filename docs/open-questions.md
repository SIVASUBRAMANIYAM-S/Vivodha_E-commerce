# Open questions

Decisions needed from the owner, grouped by the phase that needs them. When one is answered, move it to [decisions.md](decisions.md) as an ADR and delete it here.

## Phase 0 (now)

1. **Security: rotate the database password.** The DB password was pasted into the Phase 0 chat. Reset it in the Supabase Dashboard → Project Settings → Database, then run `supabase link` with the new one.
2. ~~**Hosted Supabase auth settings**~~: done 2026-10-07 (owner enabled Anonymous sign-ins and Confirm email; ADR-121).
3. **Node version:** stay on Node 22 LTS (maintenance) or move to Node 24 (active LTS)?
4. **Final logo artwork** (SVG + app icon + splash). The current mark is a code-drawn placeholder.

## Phase 1: schema

5. **Order number format** (e.g. `VV2610-000123`) and **invoice number series** per financial year (e.g. `VV/26-27/000123`).
6. **Money in paise (integer)** is assumed (ADR-118). Confirm.
7. **Admin roles:** are owner / admin / catalog_manager / order_manager / support enough? Do support users see full phone/email or masked?
8. **Return window** per category (default days? perishables non-returnable?). This drives the points-credit timing.
9. **Sample catalog for seed data:** will you provide real product data or images, or should placeholder data be used?

## Phase 2: admin core

10. Product data source: manual entry, CSV import, or a supplier feed?
11. Image guidelines (size, background) and who supplies product photos. Competitor images must not be used.
12. Who are the first admin users (emails, roles)?

## Phase 4: auth, guest & onboarding

13. **Guest → account when the email already exists:** auto-merge the guest orders after login, or link them manually through support?
14. Minimum password policy (length, complexity, breached-password check).
15. CAPTCHA provider for anonymous sign-ins (hCaptcha vs Cloudflare Turnstile).
16. Age gate for DPDP (under-18 handling)?
17. Google Maps/Places API key and billing account (for auto-detect + address autocomplete), or start with device geocoding only?

## Phase 5: catalog & home

18. Initial category tree (names, order, images).
19. "Top picks for you" logic for MVP: rules-based (purchase history + popular in category) or later ML?
20. Banner artwork source (original designs only).

## Phase 6: cart, checkout & payments

21. **Razorpay account** (business KYC) and test keys. Which methods to enable (UPI, cards, wallets, netbanking)?
22. **COD:** allowed everywhere? Maximum order value? COD fee?
23. Delivery fee, free-delivery threshold, and minimum order value (global or per pincode).
24. Delivery types: standard only, or time slots at launch?
25. Pending online payment timeout (default proposal: 30 minutes).
26. Coupon stacking rules (one coupon per order? combinable with points?).

## Phase 7: orders, returns & invoices

27. Legal entity name, registered address, **GSTIN**, state, and **FSSAI** licence number.
28. Refund method for COD orders (UPI/bank details vs Vivo Points) and refund SLA.
29. Should cancellation be allowed after packing (with a fee)?

## Phase 8: admin orders & delivery

30. Initial **serviceable pincodes**, the mode per pincode (own delivery / courier), and ETAs.
31. Courier partner(s) for the manual AWB phase.

## Phase 9: Vivo Points

32. Is the points value on returned or cancelled items always reversed? Does the delivery fee earn points?
33. Expiry reminder timing (30 days before?) and channel.
34. Can Vivo price and coupons combine?

## Phase 10: AI shopping list

35. **Vision model provider** and budget (per-list cost cap). The key will live only in Edge Function secrets.
36. Retention period for list photos (proposal: 30 days).
37. Supported languages for handwritten lists (English only, or Hindi/Tamil/... too)?

## Phase 11: notifications, analytics & crash

38. Resend account + sending domain (SPF/DKIM). Sender name/email.
39. Firebase project (Analytics + FCM) owner account.
40. Sentry organisation / project.

## Phase 12: release

41. Google Play developer account (organisation account recommended), app name, package id (proposal: `in.vivodha.app`).
42. Expo / EAS account owner and build profiles (dev/staging/prod Supabase projects: one project or three?).
43. Support email/phone and the **grievance officer** details for the policy pages.
44. Domain for the web policy pages and the account-deletion URL.
