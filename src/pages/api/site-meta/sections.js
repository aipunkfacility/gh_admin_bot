import { checkAuth, unauthorizedResponse } from '../../../lib/auth.js';
import { getCollection, saveCollection } from '../../../lib/data-store.js';

export const POST = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { sections } = await request.json();

        if (!Array.isArray(sections)) {
            return new Response(JSON.stringify({ error: 'Invalid sections data' }), { status: 400 });
        }

        // Get current site-meta
        const siteMeta = await getCollection('site-meta.json');

        // Update sections
        siteMeta.sections = sections;

        // Save
        await saveCollection('site-meta.json', siteMeta);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
