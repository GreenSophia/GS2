import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionToken, COOKIE_NAME } from './lib/auth';

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await sessionToken();
  if (cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

// ログイン画面・ログインAPI・LINE Webhook・静的アセットは認証不要
export const config = {
  matcher: ['/((?!login|api/login|api/line|_next|favicon.ico).*)'],
};
