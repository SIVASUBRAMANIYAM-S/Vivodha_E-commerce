import { Redirect } from 'expo-router';

// Phase 0: open straight to Home. Phase 4 routes first launch through (onboarding)/splash.
export default function Index() {
  return <Redirect href="/home" />;
}
