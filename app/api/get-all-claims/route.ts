import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');     // optional filter
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseClient();

    let query = supabase
      .from('user_reward_claims')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
    }

    return NextResponse.json({ claims: data ?? [], total: count ?? 0, page, pageSize });
  } catch (err) {
    console.error('[get-all-claims] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
