import type { APIRoute } from 'astro';
import { writeJsonFile } from '../../../lib/bot/utils.js';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    if (!checkAuth(request)) {
        const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
        if (ADMIN_PASSWORD) {
            const { getAuthToken } = await import('../../../lib/auth');
            const expectedToken = getAuthToken(ADMIN_PASSWORD);
            const cookieToken = cookies.get('gh_admin_auth')?.value;
            if (cookieToken !== expectedToken) return unauthorizedResponse();
        } else {
            return unauthorizedResponse();
        }
    }

    try {
        const payload = await request.json();
        const { saveSingleObject } = await import('../../../lib/data-store');

        // Глобальные настройки сайта сохраняем в site-meta.json с мерджем
        await saveSingleObject('site-meta.json', payload);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error('SiteMeta API error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
