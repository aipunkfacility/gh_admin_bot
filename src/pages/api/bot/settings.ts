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
        const { saveItem } = await import('../../../lib/data-store');

        if (type === 'rates') {
            // Payload is { rub_rate: 280, ... }
            // We need to save each one.
            const updates = [
                { id: 'RUB', rate: payload.rub_rate },
                { id: 'USDT', rate: payload.usdt_rate },
                { id: 'USD', rate: payload.usd_rate },
                { id: 'EUR', rate: payload.eur_rate },
                { id: 'CNY', rate: payload.cny_rate }
            ];

            // Parallel save
            await Promise.all(updates.map(u => saveItem('rates', u)));

            // Also keep legacy file updated? 
            // Ideally no, but for safety in transition we could.
            // But writeJsonFile is legacy. Let's trust data-store (which writes to file if Supabase off).

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
