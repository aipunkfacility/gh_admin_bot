import type { APIRoute } from 'astro';
import { saveCollection, saveSingleObject } from '../../../lib/data-store.js';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
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
    } catch (error: unknown) {
        console.error('Reorder API error:', error);
        const msg = error instanceof Error ? error.message : 'Server error';
        return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
}
