import { getCollection, saveSingleObject } from '../../../lib/data-store';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const GET = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    const data = await getCollection('site-meta.json');
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const POST = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const body = await request.json();
        const saved = await saveSingleObject('site-meta.json', body);
        return new Response(JSON.stringify(saved), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
