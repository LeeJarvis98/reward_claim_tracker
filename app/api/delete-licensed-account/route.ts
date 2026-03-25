import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('licensed_accounts')
      .delete()
      .eq('account_id', accountId);

    if (error) {
      console.error('[delete-licensed-account] error:', error);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[delete-licensed-account] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}