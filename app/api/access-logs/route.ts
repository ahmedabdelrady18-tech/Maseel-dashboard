import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const role = request.cookies.get('dashboard_role')?.value;

  if (role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data || [], {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}