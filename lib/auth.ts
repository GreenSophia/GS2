// 「あいことば」認証: passcode + secret のSHA-256をCookieに保存し、middlewareで照合する
export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(
    `${process.env.GS_PASSCODE}:${process.env.AUTH_SECRET}`
  );
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const COOKIE_NAME = 'gs_session';
