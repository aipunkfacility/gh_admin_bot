import type { APIRoute } from 'astro';
import { getCollection, saveCollection } from '../../../lib/data-store';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const PUT: APIRoute = async ({ request, params }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { collection } = params;

        if (!collection) {
            return new Response(JSON.stringify({ error: 'No collection specified' }), { status: 400 });
        }

        const body = await request.json();
        const { order } = body;

        if (!order || !Array.isArray(order)) {
            return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
        }

        interface SortableItem { id: string;[key: string]: unknown }
        const items = await getCollection<SortableItem[]>(`${collection}.json`);

        const itemMap = new Map(items.map(item => [item.id, item]));

        const newItems: SortableItem[] = order
            .map((id: string) => itemMap.get(id))
            .filter((item): item is SortableItem => item !== undefined);

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
