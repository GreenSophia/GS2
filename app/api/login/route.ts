import { NextResponse } from 'next/server';
import { sessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  const { passcode } = await req.json();
  if (passcode !== process.env.GS_PASSCODE) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await sessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 180, // 半年間ログイン維持
    path: '/',
  });
  return res;
}
