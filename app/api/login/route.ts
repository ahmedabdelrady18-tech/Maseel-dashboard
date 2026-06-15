import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { saveAuditLog } from '@/lib/auditLog';
console.log('ENV URL =', process.env.SUPABASE_URL);
console.log('ENV KEY =', process.env.SUPABASE_ANON_KEY?.substring(0,20));

const accessMap: Record<string, string | undefined> = {
  ADMIN: process.env.ACCESS_ADMIN,
  CLIENT: process.env.ACCESS_CLIENT,
  CONSULTANT: process.env.ACCESS_CONSULTANT,
  CONTRACTOR_TEAM: process.env.ACCESS_CONTRACTOR_TEAM,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name || '').trim();
    const role = String(body.role || '').trim();
    const accessCode = String(body.accessCode || '').trim();

    if (!name || !role || !accessCode) {
      return NextResponse.json(
        { error: 'Name, role and password are required' },
        { status: 400 }
      );
    }

    const correctCode = accessMap[role];

    if (!correctCode || accessCode !== correctCode) {
      return NextResponse.json(
        { error: 'Invalid access type or password' },
        { status: 401 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');

    const ip =
      forwardedFor?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    const country =
      request.headers.get('x-vercel-ip-country') ||
      'Unknown';

    const city =
      request.headers.get('x-vercel-ip-city') ||
      'Unknown';

    const userAgent =
      request.headers.get('user-agent') ||
      'Unknown';

    await saveAuditLog({
      name,
      role,
      ip,
      country,
      city,
      user_agent: userAgent,
    });

    const response = NextResponse.json({
      ok: true,
      name,
      role,
    });

    response.cookies.set('dashboard_auth', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    response.cookies.set('dashboard_user', name, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    response.cookies.set('dashboard_role', role, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error: any) {
    console.error('Login API Error:', error);

    return NextResponse.json(
      { error: error?.message || 'Login failed' },
      { status: 500 }
    );
  }
}