import {
  Coins,
  FolderTree,
  Images,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Phase that delivers the page (docs/phases.md). */
  phase: string;
  summary: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    phase: 'Phase 8',
    summary: "Today's orders, revenue, low stock and pending returns at a glance.",
  },
  {
    href: '/products',
    label: 'Products',
    icon: Package,
    phase: 'Phase 3',
    summary: 'Products, variants (generic attribute sets), images, pricing and Vivo price.',
  },
  {
    href: '/categories',
    label: 'Categories',
    icon: FolderTree,
    phase: 'Phase 3',
    summary: 'Category tree, ordering, images and point boosters.',
  },
  {
    href: '/brands',
    label: 'Brands',
    icon: Tags,
    phase: 'Phase 3',
    summary: 'Brand list and logos.',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Warehouse,
    phase: 'Phase 3',
    summary: 'Stock per variant and seller, low-stock thresholds.',
  },
  {
    href: '/orders',
    label: 'Orders',
    icon: ShoppingBag,
    phase: 'Phase 8',
    summary: 'Order queue, status updates, cancellations, returns and refunds.',
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: Users,
    phase: 'Phase 8',
    summary: 'Customer list, guest orders, addresses and points balance.',
  },
  {
    href: '/banners',
    label: 'Banners',
    icon: Images,
    phase: 'Phase 3',
    summary: 'Home banners and home sections layout.',
  },
  {
    href: '/coupons',
    label: 'Coupons',
    icon: TicketPercent,
    phase: 'Phase 6',
    summary: 'Coupon rules, limits and redemptions.',
  },
  {
    href: '/pincodes',
    label: 'Pincodes',
    icon: MapPin,
    phase: 'Phase 8',
    summary: 'Serviceable pincodes, delivery mode (own delivery / courier), fees and ETAs.',
  },
  {
    href: '/points',
    label: 'Vivo Points',
    icon: Coins,
    phase: 'Phase 9',
    summary: 'Points rules, ledger and manual adjustments.',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    phase: 'Phase 3',
    summary: 'Store config (logo, theme, home layout), feature flags and admin users.',
  },
];

export function navItem(href: string): NavItem {
  const item = NAV_ITEMS.find((i) => i.href === href);
  if (!item) throw new Error(`Unknown admin nav item: ${href}`);
  return item;
}
