import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import { useAuth } from '@/features/auth/components/AuthProvider';

export default function LocationScreen() {
  const { session } = useAuth();
  return (
    <AuthScreen
      title="Set delivery location"
      description="Your sign-in is ready. Location and saved-address setup is the next Phase 3 checkpoint, after the Android auth review. No serviceability result has been checked yet."
    >
      <Button
        title={session ? 'Browse while location setup is pending' : 'Back to welcome'}
        onPress={() => router.replace(session ? '/home' : '/welcome')}
      />
    </AuthScreen>
  );
}
