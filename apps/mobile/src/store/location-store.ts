import { create } from 'zustand';

/**
 * App-wide delivery location. Deliberately not persisted yet — Step 8 wraps
 * this in zustand/persist (AsyncStorage, survives logout, same pattern as
 * cart-store) once the full location feature (GPS, Places, address switcher)
 * lands. Until then it only drives in-session onboarding routing.
 */
type LocationState = {
  pincode: string | null;
  /** Null until a check_pincode result has been recorded for `pincode`. */
  serviceable: boolean | null;
  setLocation: (pincode: string, serviceable: boolean) => void;
  clear: () => void;
};

export const useLocationStore = create<LocationState>()((set) => ({
  pincode: null,
  serviceable: null,
  setLocation: (pincode, serviceable) => set({ pincode, serviceable }),
  clear: () => set({ pincode: null, serviceable: null }),
}));
