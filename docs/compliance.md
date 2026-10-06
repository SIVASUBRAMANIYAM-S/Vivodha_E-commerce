# Compliance checklist (India, draft)

> Not legal advice. Have a qualified CA / lawyer review this before launch. Items marked **TBD - owner decision** need business inputs.

## 1. GST tax invoice (CGST Rules, Rule 46)

Every order generates a tax invoice (PDF in the `invoices` bucket, Phase 7) with:

- Supplier legal name, address, and **GSTIN** (from `sellers` / `store_config.legal`)
- **Invoice number**: consecutive, unique per financial year, ≤ 16 characters (e.g. `VV/26-27/000123`, format TBD - owner decision)
- Invoice date
- Recipient name and address. Recipient GSTIN if B2B (optional field at checkout, TBD - owner decision)
- **Place of supply** (state name + code), which decides CGST+SGST (intra-state) vs IGST (inter-state)
- Per line: description, **HSN code**, quantity, unit, value, discount, taxable value, **GST rate**, and CGST/SGST/IGST amounts
- Delivery charges as a separate line with their own GST treatment
- Total in figures and words
- Whether tax is payable on reverse charge (normally "No")
- Signature or digital signature of the supplier
- E-invoicing (IRN/QR) applies only above the turnover threshold. B2C dynamic QR may apply (TBD - owner decision, depending on turnover)
- Credit notes for returns and refunds

Data needed: `products.hsn_code`, `products.gst_rate`, seller GSTIN and state, and the address state on orders.

## 2. FSSAI (food business)

- Display the **FSSAI licence/registration number** on the app/website (footer and store info) and on invoices for food items.
- For food products, show on the product page: name, ingredients, nutrition info, **veg/non-veg mark**, allergens, net quantity, best-before/shelf life where applicable, and country of origin.
- E-commerce FBO obligations (FSSAI e-commerce guidelines): sell only from licensed sellers, ensure the remaining shelf life at delivery (≥ 30% or 45 days before expiry, as applicable), and handle food in hygienic conditions.
- `sellers.fssai_license_no` is required for any seller with food categories.

## 3. Legal Metrology (Packaged Commodities) Rules

For pre-packed goods, show: manufacturer/packer/importer name and address, **country of origin**, generic name, net quantity, **MRP (inclusive of all taxes)**, unit sale price (per kg/litre), best before/expiry date, and the consumer care contact. Product forms in Phase 2 must capture these fields (in `specs` via the attribute set).

## 4. Consumer Protection (E-Commerce) Rules, 2020

- Show the seller's details, return/refund/exchange/warranty/delivery policies, and the country of origin.
- **Grievance officer**: name, contact, and designation published. Acknowledge complaints within 48 h and resolve within 1 month.
- No manipulated prices or fake reviews. Reviews are restricted to verified purchases.
- Cancellation after confirmation can't carry a charge unless the platform bears a similar charge.
- Avoid **dark patterns** (CCPA 2023 guidelines): no false urgency, basket sneaking, forced action, or drip pricing. The free-delivery nudge and timers must be truthful.

## 5. DPDP Act 2023 (Digital Personal Data Protection) + Rules

- **Notice + consent** at sign-up and guest checkout: purpose, data collected, rights, and a grievance contact. Consent is stored (`profiles.consent_at`, marketing opt-in separate).
- **Purpose limitation and minimisation**: collect only what delivery, payment, and support need.
- **User rights**: access, correction, erasure, grievance redressal, and nomination. Available from Account plus a support email.
- **Retention**: delete or anonymise when the purpose ends, except where law requires retention (GST records must be kept ~6 years past the annual return date, so keep the invoice data and anonymise the profile).
- **Breach notification** to the Data Protection Board and affected users.
- Children: no targeted ads; verifiable parental consent is needed for under-18 users (age gate TBD - owner decision).
- Processors (Supabase, Razorpay, Resend, Firebase, Sentry, the AI provider) need DPAs, and data-transfer locations must be documented.
- AI shopping list photos: state the purpose, set a retention period, and confirm no training use.

## 6. Google Play requirements

- **Account deletion**: an in-app path (Account → Delete account) **and** a public web URL where users can request deletion without reinstalling. List what's deleted vs retained (orders/invoices kept for tax law).
- **Data safety form**: declare the data types (name, email, phone, address, approximate/precise location, purchase history, photos for the shopping list, device IDs for push/analytics, crash logs).
- Location permission: foreground only, with an in-context rationale.
- Payments: physical goods, so Razorpay is allowed (Play Billing is not required).
- Target API level per the current Play policy at release time.
- A privacy policy URL in the listing and in the app.

## 7. Policy pages (in the app and on the web)

| Page                       | Key contents                                                                                                        | Owner input needed              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Privacy policy             | DPDP notice, data categories, purposes, processors, retention, rights, grievance officer                            | Legal entity, grievance officer |
| Terms of use               | Eligibility, account, pricing errors, cancellation, liability, governing law                                        | Jurisdiction                    |
| Shipping / delivery policy | Serviceable areas, fees, free-delivery threshold, ETAs, own delivery vs courier, failed delivery                    | Fees, ETAs                      |
| Refund & return policy     | Return windows per category, non-returnable items (perishables), process, refund timelines and methods, COD refunds | Windows, timelines              |
| Vivo Points terms          | Earn/redeem/expiry rules, no cash value, changes and termination                                                    | Confirm numbers                 |
| Grievance redressal        | Officer details, timelines                                                                                          | Name/contact                    |

## 8. Payments (RBI / PCI)

- Card data is never handled by Vivodha. Razorpay Checkout handles PCI scope.
- Store only provider ids and status, never card numbers or CVV.
- Follow the card tokenisation rules (handled by Razorpay).
