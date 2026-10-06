import type { Metadata } from 'next';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = { title: 'Log in' };

/** Placeholder: Supabase email/password login + admin-role check land in Phase 2. */
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-tint p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="gap-3">
          <Logo />
          <CardTitle className="text-lg">Admin log in</CardTitle>
          <CardDescription>Sign-in is enabled in Phase 2.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" disabled />
            </div>
            <Button type="submit" size="lg" disabled>
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
