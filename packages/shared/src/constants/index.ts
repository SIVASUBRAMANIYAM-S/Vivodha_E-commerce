/**
 * App-wide constants. Business numbers (points, delivery fees, limits) live in the
 * store_config table at runtime. The values here are only fallback defaults and
 * must match docs/decisions.md.
 */

export const APP_NAME = 'vivodha';
export const TAGLINE = 'Fresh to your door';

export const CURRENCY = { code: 'INR', symbol: '₹', locale: 'en-IN', minorUnit: 100 } as const;

/** Single seller now, marketplace later: every product/order/inventory row carries seller_id. */
export const DEFAULT_SELLER_SLUG = 'vivodha';

export const ORDER_STATUSES = [
  'pending_payment',
  'placed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Mirrors the public.payment_method enum (supabase/migrations). */
export const PAYMENT_METHODS = ['upi', 'card', 'wallet', 'netbanking', 'cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Mirrors the public.payment_status enum. */
export const PAYMENT_STATUSES = [
  'created',
  'pending',
  'captured',
  'failed',
  'refunded',
  'partially_refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DELIVERY_MODES = ['own_delivery', 'courier'] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

/** Mirrors the public.admin_role enum (ADR-128). super_admin passes every has_admin_role() check. */
export const ADMIN_ROLES = ['super_admin', 'manager', 'catalog', 'orders', 'support'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** Vivo Points fallback defaults (runtime source of truth: store_config.points). */
export const POINTS_DEFAULTS = {
  earnRupeesPerPoint: 100, // 1 point per ₹100
  pointValueRupees: 1, // 1 point = ₹1
  minRedeemPoints: 50,
  maxRedeemPercentOfOrder: 20,
  categoryBoosterMultiplier: 2,
  inactivityExpiryMonths: 12,
  creditAfter: 'return_window_end',
} as const;

export const POINTS_LEDGER_REASONS = [
  'earn_order',
  'earn_booster',
  'redeem_order',
  'reverse_cancel',
  'reverse_return',
  'expire',
  'admin_adjust',
] as const;
export type PointsLedgerReason = (typeof POINTS_LEDGER_REASONS)[number];

export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const PHONE_REGEX_IN = /^[6-9][0-9]{9}$/;
export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
