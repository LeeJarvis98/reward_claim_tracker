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

    const claims = data ?? [];

    // Collect unique user_ids and fetch bank_info from the users table
    const userIds = [...new Set(claims.map((c) => c.user_id).filter(Boolean))] as string[];
    let usersMap: Record<string, { bank_info: unknown; email: string }> = {};

    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, bank_info, email')
        .in('id', userIds);

      if (usersData) {
        usersMap = Object.fromEntries(usersData.map((u) => [u.id, { bank_info: u.bank_info, email: u.email }]));
      }
    }

    const claimsWithUsers = claims.map((claim) => ({
      ...claim,
      users: claim.user_id ? (usersMap[claim.user_id] ?? null) : null,
    }));

    return NextResponse.json({ claims: claimsWithUsers, total: count ?? 0, page, pageSize });
  } catch (err) {
    console.error('[get-all-claims] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
