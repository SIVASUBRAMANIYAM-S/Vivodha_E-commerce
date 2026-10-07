import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Local cart (ADR-139): persisted on the device until the server cart lands
 * with checkout (Phase 6). Lines are price snapshots for display only; the
 * place-order Edge Function will always re-price server-side.
 */
export type CartLine = {
  variantId: string;
  productId: string;
  name: string;
  variantLabel: string;
  imageUrl: string | null;
  pricePaise: number;
  mrpPaise: number;
  maxPerOrder: number;
  quantity: number;
};

type CartState = {
  lines: Record<string, CartLine>;
  /** Adds one unit; creates the line if needed. Returns the new quantity. */
  add: (line: Omit<CartLine, 'quantity'>) => number;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: {},
      add: (line) => {
        const existing = get().lines[line.variantId];
        const next = Math.min((existing?.quantity ?? 0) + 1, line.maxPerOrder);
        set((s) => ({ lines: { ...s.lines, [line.variantId]: { ...line, quantity: next } } }));
        return next;
      },
      setQuantity: (variantId, quantity) =>
        set((s) => {
          const line = s.lines[variantId];
          if (!line) return s;
          const lines = { ...s.lines };
          if (quantity <= 0) delete lines[variantId];
          else lines[variantId] = { ...line, quantity: Math.min(quantity, line.maxPerOrder) };
          return { lines };
        }),
      clear: () => set({ lines: {} }),
    }),
    {
      name: 'vivodha-cart-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

export type CartTotals = {
  itemCount: number;
  subtotalPaise: number;
  mrpTotalPaise: number;
  savingsPaise: number;
};

export function computeTotals(lines: Record<string, CartLine>): CartTotals {
  let itemCount = 0;
  let subtotalPaise = 0;
  let mrpTotalPaise = 0;
  for (const l of Object.values(lines)) {
    itemCount += l.quantity;
    subtotalPaise += l.pricePaise * l.quantity;
    mrpTotalPaise += l.mrpPaise * l.quantity;
  }
  return { itemCount, subtotalPaise, mrpTotalPaise, savingsPaise: mrpTotalPaise - subtotalPaise };
}

/** Narrow selector: a single variant's quantity (re-renders only that card). */
export function useLineQuantity(variantId: string | undefined): number {
  return useCartStore((s) => (variantId ? (s.lines[variantId]?.quantity ?? 0) : 0));
}

export function useCartItemCount(): number {
  return useCartStore((s) => {
    let n = 0;
    for (const l of Object.values(s.lines)) n += l.quantity;
    return n;
  });
}

export function useCartSubtotal(): number {
  return useCartStore((s) => {
    let n = 0;
    for (const l of Object.values(s.lines)) n += l.pricePaise * l.quantity;
    return n;
  });
}
