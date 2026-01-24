import type { APIRoute } from 'astro';
import { getCollection, saveCollection } from '../../../lib/data-store';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const PUT: APIRoute = async ({ request, params }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { collection } = params;
        const body = await request.json();
        const { order } = body;

        if (!order || !Array.isArray(order)) {
            return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
        }

        const items = await getCollection(`${collection}.json`) as Array<{ id: string;[key: string]: unknown }>;

        const itemMap = new Map(items.map(item => [item.id, item]));

        const newItems: Array<{ id: string;[key: string]: unknown }> = order
            .map((id: string) => itemMap.get(id))
            .filter((item): item is { id: string;[key: string]: unknown } => item !== undefined);

        // Keep items not in order array at the end
        items.forEach(item => {
            if (!order.includes(item.id)) {
                newItems.push(item);
            }
        });

        await saveCollection(`${collection}.json`, newItems);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: unknown) {
        console.error(error);
        const msg = error instanceof Error ? error.message : 'Server error';
        return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
}
