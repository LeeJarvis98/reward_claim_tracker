import { getSupabaseClient } from '@/lib/supabase';
import LicensedAccountsTable from '@/components/dashboard/LicensedAccountsTable';
import { Title, Stack } from '@mantine/core';

export const dynamic = 'force-dynamic';

export default async function AddAccountPage() {
  const supabase = getSupabaseClient();

  const { data: accounts } = await supabase
    .from('licensed_accounts')
    .select('account_id, email, uid, licensed_date, id, platform, licensed_status, owner, lot_volume, reward, registered_at, entry_volume_lots, entry_reward')
    .order('licensed_date', { ascending: false });

  return (
    <Stack p="xl" gap="lg">
      <Title order={2}>Add Account ID</Title>
      <LicensedAccountsTable accounts={accounts ?? []} />
    </Stack>
  );
}