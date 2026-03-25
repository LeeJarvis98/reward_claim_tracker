import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
      return NextResponse.json({ error: 'Missing or invalid accountId' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('licensed_accounts').insert({
      email: 'manual@account.com',
      uid: 'manual_account',
      account_id: accountId.trim(),
      licensed_date: now,
      id: 'ADMIN',
      platform: 'exness',
      licensed_status: 'licensed',
      owner: 'ADMIN',
      registered_at: now,
      lot_volume: null,
      reward: null,
      entry_volume_lots: null,
      entry_reward: null,
    });

    if (error) {
      console.error('[add-licensed-account] error:', error);
      return NextResponse.json({ error: 'Failed to add account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[add-licensed-account] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}