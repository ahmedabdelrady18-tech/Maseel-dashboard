import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getDashboardData();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
