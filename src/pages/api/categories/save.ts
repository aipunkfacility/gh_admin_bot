import type { APIRoute } from 'astro';
import { saveItem } from '../../../lib/data-store.js';
import { unauthorizedResponse } from '../../../lib/auth';

export const prerender = false;

function generateId() {
    return Math.random().toString(36).slice(2, 11);
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')        // Remove all non-word chars
        .replace(/--+/g, '-')           // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export const POST: APIRoute = async ({ request, cookies }) => {
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    if (ADMIN_PASSWORD) {
        const { getAuthToken } = await import('../../../lib/auth');
        const expectedToken = getAuthToken(ADMIN_PASSWORD);
        const cookieToken = cookies.get('gh_admin_auth')?.value;
        if (cookieToken !== expectedToken) return unauthorizedResponse();
    }

    try {
        const { collection, data } = await request.json();

        if (!['transport-categories', 'excursion-categories'].includes(collection)) {
            return new Response(JSON.stringify({ error: 'Invalid collection' }), { status: 400 });
        }

        const item = { ...data };

        // Auto-generate ID if missing
        if (!item.id) {
            item.id = generateId();
        }

        // Auto-generate slug if missing
        if (!item.slug && item.title) {
            item.slug = slugify(item.title);
        }

        await saveItem(`${collection}.json`, item);

        return new Response(JSON.stringify({ success: true, item }), { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Category Save API error:', error);
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
