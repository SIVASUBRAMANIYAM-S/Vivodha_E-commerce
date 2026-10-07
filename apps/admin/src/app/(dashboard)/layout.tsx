import { Sidebar } from '@/components/layout/sidebar';

// Phase 2 adds the admin-role guard here (redirect to /login when not an admin).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-sm text-muted-foreground">Store admin</span>
          <span className="rounded-full bg-tint px-3 py-1 text-xs font-medium text-primary">
            Phase 0 · foundation
          </span>
        </header>
        <main className="flex-1 bg-sidebar/40 p-6">{children}</main>
      </div>
    </div>
  );
}
