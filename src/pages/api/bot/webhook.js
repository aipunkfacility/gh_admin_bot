import { bot } from '../../../lib/bot/index.js';

export const prerender = false;

export async function POST({ request }) {
    try {
        const secret = request.headers.get('x-telegram-bot-api-secret-token');

        // Проверка секретного токена
        if (secret !== process.env.WEBHOOK_SECRET) {
            return new Response('Unauthorized', { status: 401 });
        }

        const update = await request.json();

        // Обработка обновления
        await bot.handleUpdate(update);

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
