import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** In-memory, per app session: one-time celebrations. Resets on cold start. */
type SessionState = {
  freeDeliveryCelebrated: boolean;
  markFreeDeliveryCelebrated: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
  freeDeliveryCelebrated: false,
  markFreeDeliveryCelebrated: () => set({ freeDeliveryCelebrated: true }),
}));

/**
 * Recently viewed product ids, newest first, persisted on the device. The
 * server-side recently_viewed table needs a session; this local list feeds the
 * Home rail until auth lands (Phase 4).
 */
type RecentlyViewedState = {
  productIds: string[];
  push: (productId: string) => void;
};

const MAX_RECENT = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      push: (productId) =>
        set((s) => ({
          productIds: [productId, ...s.productIds.filter((id) => id !== productId)].slice(
            0,
            MAX_RECENT,
          ),
        })),
    }),
    { name: 'vivodha-recently-viewed-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
