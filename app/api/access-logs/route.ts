import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readAccessLogs } from '@/lib/accessLog';

export async function GET(request: NextRequest) {
  const role = request.cookies.get('dashboard_role')?.value;

  if (role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  const logs = readAccessLogs();

  return NextResponse.json(logs, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}