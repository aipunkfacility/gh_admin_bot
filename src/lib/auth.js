const COOKIE_NAME = 'gh_admin_auth';

export function checkAuth(request) {
  const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return false;

  const cookie = request.headers.get('cookie') || '';
  if (!cookie) return false;

  const cookies = {};
  cookie.split(';').forEach(c => {
    const parts = c.trim().split('=');
    if (parts.length >= 2) {
      cookies[parts[0]] = parts.slice(1).join('=');
    }
  });

  return cookies[COOKIE_NAME] === ADMIN_PASSWORD;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
