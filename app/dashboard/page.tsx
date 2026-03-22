import { getSupabaseClient } from '@/lib/supabase';
import StatsCards from '@/components/dashboard/StatsCards';
import ClaimsTable from '@/components/dashboard/ClaimsTable';
import { Stack, Title } from '@mantine/core';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = getSupabaseClient();

  // Fetch recent claims (last 200 records) for the table
  const { data: claims } = await supabase
    .from('user_reward_claims')
    .select('id, user_id, partner_id, platform, level, reward_usd, reward_text, status, chosen_reward, completed_at, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);

  // Aggregate counts per status
  const total = claims?.length ?? 0;
  const notClaimed = claims?.filter((c) => c.status === 'not_claimed').length ?? 0;
  const processing = claims?.filter((c) => c.status === 'processing').length ?? 0;
  const completed = claims?.filter((c) => c.status === 'completed').length ?? 0;

  return (
    <Stack p="xl" gap="lg">
      <Title order={2}>Reward Claims Dashboard</Title>
      <StatsCards
        total={total}
        notClaimed={notClaimed}
        processing={processing}
        completed={completed}
      />
      <ClaimsTable claims={claims ?? []} />
    </Stack>
  );
}
