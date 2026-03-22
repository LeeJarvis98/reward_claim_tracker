import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const VALID_STATUSES = ['not_claimed', 'processing', 'completed', 'rejected'] as const;

export async function POST(request: NextRequest) {
  try {
    const { claimId, status } = await request.json();

    if (!claimId || !status) {
      return NextResponse.json({ error: 'Missing claimId or status' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_reward_claims')
      .update(updateData)
      .eq('id', claimId);

    if (error) {
      console.error('[update-claim-status] error:', error);
      return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[update-claim-status] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
