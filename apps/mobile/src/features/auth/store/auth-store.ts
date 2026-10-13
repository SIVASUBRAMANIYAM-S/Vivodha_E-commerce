import { useAuth } from '../components/AuthProvider';

export function useSession() {
  return useAuth().session;
}

export function useIsGuest() {
  return useAuth().session?.user.is_anonymous ?? false;
}
