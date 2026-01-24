import type { APIRoute, APIContext } from 'astro';
import { LoginSchema } from '../../lib/schemas';

export const prerender = false;

const COOKIE_NAME = 'gh_admin_auth';

export const POST: APIRoute = async ({ request, cookies, url }: APIContext) => {
    const searchParams = new URL(url).searchParams;
    const action = searchParams.get('action');

    if (action === 'login') {
        try {
            const body = await request.json();
            const result = LoginSchema.safeParse(body);

            if (!result.success) {
                return new Response(JSON.stringify({ error: result.error.errors }), { status: 400 });
            }

            const { password } = result.data;
            const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

            if (password === ADMIN_PASSWORD) {
                cookies.set(COOKIE_NAME, ADMIN_PASSWORD, {
                    path: '/',
                    httpOnly: true,
                    secure: import.meta.env.PROD, // Auto-detect environment
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                });
                return new Response(JSON.stringify({ success: true }), { status: 200 });
            }

            return new Response(JSON.stringify({ error: 'Incorrect password' }), { status: 401 });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid Request' }), { status: 400 });
        }
    }

    if (action === 'logout') {
        cookies.delete(COOKIE_NAME, { path: '/' });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
};

// --- Helper Functions ---

// Keep these for reuse, but in TS they should ideally be in a middleware or lib
export function checkAuth(request: Request): boolean {
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) return false;

    const cookieStr = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(cookieStr.split('; ').map(v => v.split('=')));

    return cookies[COOKIE_NAME] === ADMIN_PASSWORD;
}

export function unauthorizedResponse(): Response {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });
}
