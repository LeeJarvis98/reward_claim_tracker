import { getSupabaseClient } from '@/lib/supabase';
import AppShell from '@/components/layout/AppShell';
import UsersBankAside from '@/components/dashboard/UsersBankAside';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();

  const { data: users } = await supabase
    .from('users')
    .select('id, email, bank_info, status, referral_id, created_at')
    .order('created_at', { ascending: false });

  return (
    <AppShell aside={<UsersBankAside users={users ?? []} />}>
      {children}
    </AppShell>
  );
}
