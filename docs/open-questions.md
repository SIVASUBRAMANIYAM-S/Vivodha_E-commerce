# Open questions

Decisions needed from the owner, grouped by the phase that needs them. When one is answered, move it to [decisions.md](decisions.md) as an ADR and delete it here.

## Phase 0 (now)

1. **Security: rotate the database password.** The DB password was pasted into the Phase 0 chat. Reset it in the Supabase Dashboard → Project Settings → Database, then run `supabase link` with the new one.
2. ~~**Hosted Supabase auth settings**~~: done 2026-10-07 (owner enabled Anonymous sign-ins and Confirm email; ADR-121).
3. **Node version:** stay on Node 22 LTS (maintenance) or move to Node 24 (active LTS)?
4. ~~**Final logo artwork**~~: done 2026-10-08, real SVG mark + app icons shipped in Phase 1 (ADR-123).

## Phase 1: schema

5. ~~**Order number / invoice number format**~~: done 2026-10-08 (ADR-124, ADR-125).
6. **Money in paise (integer)** is assumed (ADR-118). Confirm.
7. ~~**Admin roles**~~: resolved 2026-10-08 as super_admin/manager/catalog/orders/support (ADR-128). Whether support sees full or masked phone/email is still open.
8. ~~**Return window per category**~~: done 2026-10-08 (ADR-126, ADR-127).
9. ~~**Sample catalog for seed data**~~: done 2026-10-08, 40 placeholder products seeded in Phase 1. Real product data/images remain open (see Q10, Q11).

## Phase 2: admin core

10. Product data source: manual entry, CSV import, or a supplier feed?
11. Image guidelines (size, background) and who supplies product photos. Competitor images must not be used.
12. ~~**First admin user**~~: done 2026-10-08, `sivasaravanan492@gmail.com` seeded as super_admin (ADR-131). Further admin users remain open.

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

30. ~~**Initial serviceable pincodes**~~: placeholder rows seeded 2026-10-08 (`is_placeholder = true`, ADR-130). The owner still needs to supply the real serviceable area and ETAs.
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
42. Expo / EAS account owner and build profiles. ~~DEV vs PROD Supabase projects~~ resolved 2026-10-08: current linked project is DEV, PROD created in Phase 12 (ADR-129).
43. Support email/phone and the **grievance officer** details for the policy pages.
44. Domain for the web policy pages and the account-deletion URL.
