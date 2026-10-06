import { create } from 'zustand';

/** App-wide delivery location. Persistence and serviceability check land in Phase 4. */
type LocationState = {
  pincode: string | null;
  setPincode: (pincode: string | null) => void;
};

export const useLocationStore = create<LocationState>()((set) => ({
  pincode: null,
  setPincode: (pincode) => set({ pincode }),
}));
