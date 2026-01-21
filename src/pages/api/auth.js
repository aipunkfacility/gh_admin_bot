export const prerender = false;

const COOKIE_NAME = 'gh_admin_auth';

export async function POST({ request, cookies }) {
  const { url } = request;
  const searchParams = new URL(url).searchParams;
  const action = searchParams.get('action');

  if (action === 'login') {
    const { password } = await request.json();
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

    console.log('DEBUG AUTH:', {
      receivedPassword: password,
      envPassword: ADMIN_PASSWORD,
      match: password === ADMIN_PASSWORD
    });

    if (password === ADMIN_PASSWORD) {
      cookies.set(COOKIE_NAME, ADMIN_PASSWORD, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Incorrect password' }), { status: 401 });
  }

  if (action === 'logout') {
    cookies.delete(COOKIE_NAME, { path: '/' });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
}

export function checkAuth(request) {
  const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return false;

  const cookieStr = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieStr.split('; ').map(v => v.split('=')));

  return cookies[COOKIE_NAME] === ADMIN_PASSWORD;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

