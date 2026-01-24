import type { APIRoute } from 'astro';
import { writeJsonFile } from '../../../lib/bot/utils.js';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    // Проверяем авторизацию через HMAC
    if (!checkAuth(request)) {
        // Fallback check for session cookies if header is missing (e.g. standard form post)
        const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
        if (ADMIN_PASSWORD) {
            const { getAuthToken } = await import('../../../lib/auth');
            const expectedToken = getAuthToken(ADMIN_PASSWORD);
            const cookieToken = cookies.get('gh_admin_auth')?.value;
            if (cookieToken !== expectedToken) {
                return unauthorizedResponse();
            }
        } else {
            return unauthorizedResponse();
        }
    }

    try {
        const data = await request.json();
        const { type, payload } = data;

        if (type === 'rates') {
            await writeJsonFile('rates.json', payload);
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        if (type === 'admins') {
            await writeJsonFile('admins.json', payload);
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Settings API error:', error);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}

export const GET: APIRoute = async ({ request }) => {
    // Просто проверка авторизации для UI
    if (!checkAuth(request)) return unauthorizedResponse();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
