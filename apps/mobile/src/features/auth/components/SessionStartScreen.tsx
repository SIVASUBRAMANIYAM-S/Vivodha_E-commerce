import { Redirect } from 'expo-router';

import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProfile } from '../hooks/useProfile';
import { authErrorMessage } from '../api/auth-errors';
import { useAuth } from './AuthProvider';
import { needsPassword } from '../api/session-route';
import { AuthScreen } from './AuthScreen';

export function SessionStartScreen() {
  const { session, loading, error, recovery, retry } = useAuth();
  const profile = useProfile();
  if (error)
    return (
      <AuthScreen title="Let’s reconnect">
        <ErrorState message={error} onRetry={retry} />
      </AuthScreen>
    );
  if (loading)
    return (
      <AuthScreen title="Vivodha">
        <Skeleton height={64} />
        <Skeleton height={24} />
      </AuthScreen>
    );
  if (!session) return <Redirect href="/welcome" />;
  if (needsPassword(session.user, recovery)) {
    return <Redirect href="/set-password" />;
  }
  if (profile.isPending)
    return (
      <AuthScreen title="Getting ready">
        <Skeleton height={64} />
      </AuthScreen>
    );
  if (profile.isError)
    return (
      <AuthScreen title="Your delivery location">
        <ErrorState
          message={authErrorMessage(profile.error)}
          onRetry={() => void profile.refetch()}
        />
      </AuthScreen>
    );
  return <Redirect href={profile.data.default_pincode ? '/home' : '/location'} />;
}
