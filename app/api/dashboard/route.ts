import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/excel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = getDashboardData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to load dashboard data',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}