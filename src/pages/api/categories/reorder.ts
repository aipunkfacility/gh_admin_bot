import type { APIRoute } from 'astro';
import { saveCollection, saveSingleObject } from '../../../lib/data-store.js';
import { unauthorizedResponse } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    if (ADMIN_PASSWORD) {
        const { getAuthToken } = await import('../../../lib/auth');
        const expectedToken = getAuthToken(ADMIN_PASSWORD);
        const cookieToken = cookies.get('gh_admin_auth')?.value;
        if (cookieToken !== expectedToken) return unauthorizedResponse();
    }

    try {
        const { collection, items } = await request.json();

        if (collection === 'sections') {
            await saveSingleObject('site-meta.json', { sections: items });
        } else if (['transport-categories', 'excursion-categories'].includes(collection)) {
            await saveCollection(`${collection}.json`, items);
        } else {
            return new Response(JSON.stringify({ error: 'Invalid collection' }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error('Reorder API error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
