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

        const items: any[] = await getCollection(`${collection}.json`);

        const itemMap = new Map(items.map(item => [item.id, item]));

        const newItems = order
            .map((id: string) => itemMap.get(id))
            .filter(item => item !== undefined);

        // Keep items not in order array at the end (or as is?) 
        // Original logic appends missing items to the end
        items.forEach(item => {
            if (!order.includes(item.id)) {
                newItems.push(item);
            }
        });

        await saveCollection(`${collection}.json`, newItems);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
    }
}
