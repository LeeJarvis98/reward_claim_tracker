import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_reward_claims')
      .select('status, reward_usd');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const stats = {
      total: data.length,
      not_claimed: data.filter((c) => c.status === 'not_claimed').length,
      processing: data.filter((c) => c.status === 'processing').length,
      completed: data.filter((c) => c.status === 'completed').length,
      rejected: data.filter((c) => c.status === 'rejected').length,
      total_reward_usd: data
        .filter((c) => c.status === 'completed')
        .reduce((sum, c) => sum + (c.reward_usd ?? 0), 0),
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error('[get-dashboard-stats] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
