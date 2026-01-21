import { getItem, saveItem, deleteItem } from '../../../lib/data-store';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';
import { validateItem, sanitizeItem } from '../../../lib/validation';

// Helper to validate ID and collection name
const isValidId = (id) => /^[a-zA-Z0-9._-]+$/.test(id);

export const GET = async ({ params, request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    const { collection, id } = params;
    
    if (!isValidId(collection) || !isValidId(id)) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
    }

    const item = await getItem(`${collection}.json`, id);

    if (!item) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(item), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const POST = async ({ request, params }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { collection } = params;
        
        if (!isValidId(collection)) {
            return new Response(JSON.stringify({ error: 'Invalid collection' }), { status: 400 });
        }

        let body = await request.json();

        body = sanitizeItem(body);

        const validation = validateItem(collection, body);
        if (!validation.valid) {
            return new Response(JSON.stringify({ 
                error: 'Validation failed', 
                details: validation.errors 
            }), { status: 400 });
        }

        if (!body.id && !body.slug) {
            body.id = Date.now().toString();
        }

        const savedItem = await saveItem(`${collection}.json`, body);
        return new Response(JSON.stringify(savedItem), { status: 200 });

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export const DELETE = async ({ params, request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    const { collection, id } = params;
    
    if (!isValidId(collection) || !isValidId(id)) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
    }

    await deleteItem(`${collection}.json`, id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
};
