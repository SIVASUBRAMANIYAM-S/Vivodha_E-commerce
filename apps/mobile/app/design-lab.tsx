import { Redirect } from 'expo-router';

import type { DesignLab as DesignLabComponent } from '@/dev/DesignLab';

/**
 * Dev-only Design Lab (ADR-141). Metro inlines __DEV__ and constant-folds the
 * dead branch in production builds, so the lab module is never required (and
 * never bundled) there; in development it is required lazily on first open.
 */
export default function DesignLabRoute() {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DesignLab } = require('@/dev/DesignLab') as { DesignLab: typeof DesignLabComponent };
    return <DesignLab />;
  }
  return <Redirect href="/home" />;
}
