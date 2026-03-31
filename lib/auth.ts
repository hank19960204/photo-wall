import { cookies } from 'next/headers';

const SESSION_COOKIE = 'pw_admin_session';
const MAX_AGE = 60 * 60 * 8; // 8 小時

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  const token = process.env.ADMIN_SESSION_TOKEN;
  if (!token) return false;
  return session?.value === token;
}

export function buildSessionCookie(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: MAX_AGE,
    path: '/',
  };
}
