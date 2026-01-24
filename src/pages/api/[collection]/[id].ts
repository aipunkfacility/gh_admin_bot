import type { APIRoute } from 'astro';
import { getItem, saveItem, deleteItem } from '../../../lib/data-store';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';
import { TransportSchema, ExcursionSchema, AccommodationSchema } from '../../../lib/schemas';
import { z } from 'zod';

// Helper to validate ID and collection name
const isValidId = (id: string) => /^[a-zA-Z0-9._-]+$/.test(id);

const SCHEMAS: Record<string, z.ZodTypeAny> = {
    'transport-items': TransportSchema,
    'excursions': ExcursionSchema,
    'accommodations': AccommodationSchema,
    // Add other collections here if needed
};

// Map legacy collection names if they differ from schemas
const getSchema = (collection: string) => {
    // Try direct match
    if (SCHEMAS[collection]) return SCHEMAS[collection];
    // Fallback or explicit mapping
    if (collection === 'transport') return TransportSchema;
    return null;
};

export const GET: APIRoute = async ({ params, request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    const { collection, id } = params;

    if (!collection || !id || !isValidId(collection) || !isValidId(id)) {
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

export const POST: APIRoute = async ({ request, params }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { collection } = params;

        if (!collection || !isValidId(collection)) {
            return new Response(JSON.stringify({ error: 'Invalid collection' }), { status: 400 });
        }

        let body = await request.json();

        // Schema Validation
        const schema = getSchema(collection);
        if (schema) {
            const result = schema.safeParse(body);
            if (!result.success) {
                return new Response(JSON.stringify({
                    error: 'Validation failed',
                    details: result.error.errors
                }), { status: 400 });
            }
            body = result.data; // use clean data
        } else {
            console.warn(`No schema found for collection: ${collection}`);
        }

        if (!body.id && !body.slug) {
            body.id = Date.now().toString();
        }

        const savedItem = await saveItem(`${collection}.json`, body);
        return new Response(JSON.stringify(savedItem), { status: 200 });

    } catch (e: unknown) {
        console.error(e);
        const msg = e instanceof Error ? e.message : 'Internal Error';
        return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
}

export const DELETE: APIRoute = async ({ params, request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    const { collection, id } = params;

    if (!collection || !id || !isValidId(collection) || !isValidId(id)) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
    }

    await deleteItem(`${collection}.json`, id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
};
