import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password;
  const correctPassword = process.env.DASHBOARD_PASSWORD || '123456';

  if (password !== correctPassword) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('dashboard_auth', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
