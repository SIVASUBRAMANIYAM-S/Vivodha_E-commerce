import type { LucideIcon } from 'lucide-react-native';
import { Hammer } from '@/components/icons';

import { Screen } from './Screen';
import { EmptyState } from './States';
import { Text } from './Text';

type Props = { title: string; phase: string; description?: string; icon?: LucideIcon };

/** Placeholder for routes whose feature phase hasn't shipped yet. */
export function PlaceholderScreen({ title, phase, description, icon = Hammer }: Props) {
  return (
    <Screen>
      <Text variant="h1" accessibilityRole="header">
        {title}
      </Text>
      <EmptyState icon={icon} title={`Coming in ${phase}`} message={description} />
    </Screen>
  );
}
