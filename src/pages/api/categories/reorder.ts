import type { APIRoute } from 'astro';
import { saveItem } from '../../../lib/data-store';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (!checkAuth(request)) {
        return unauthorizedResponse();
    }

    try {
        const { collection, items } = await request.json();

        if (['sections', 'transport-categories', 'excursion-categories'].includes(collection)) {
            // New Logic: Update order in DB
            // We use getTableName from data-store internal logic or map manually.
            let tableName = collection;
            if (tableName.endsWith('.json')) tableName = tableName.slice(0, -5);
            if (tableName.includes('-')) tableName = tableName.replace(/-/g, '_');

            // Parallel update of 'order' field
            // Note: We receive the full array in new order.
            // Items: [{ id: '...', ... }]
            const updates = items.map((item: any, index: number) => {
                // Determine ID key. Sections use 'slug' as ID in payload but upsert needs ID or unique key. 
                // For sections we have id=slug.
                // For categories we use uuid.

                // Construct minimal payload for update
                const payload = {
                    ...item,
                    order: index,
                    // Ensure required constraint keys are present
                    // 'sections' -> slug (which is id in payload usually)
                    // 'categories' -> id (uuid)
                };

                // For sections, payload.id is actually the slug.
                if (collection === 'sections') {
                    payload.slug = item.id;
                    // remove 'id' if it conflicts with potential DB id column if we rely on slug upsert
                }

                return saveItem(collection, payload);
            });

            await Promise.all(updates);
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
