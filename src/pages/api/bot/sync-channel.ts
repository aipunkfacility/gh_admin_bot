import type { APIRoute } from 'astro';
import { bot } from '../../../lib/bot/index.js';
import { checkAuth, unauthorizedResponse } from '../../../lib/auth';
import { readJsonFile, writeJsonFile, getFullImageUrl, formatExcursionCard, formatTransportCard, formatAccommodationCard, formatServiceCard } from '../../../lib/bot/utils.js';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (!checkAuth(request)) return unauthorizedResponse();

    try {
        const { collection, id } = await request.json();
        const channelId = String(import.meta.env.TELEGRAM_CHANNEL_ID || '');

        if (!channelId) {
            return new Response(JSON.stringify({ error: 'TELEGRAM_CHANNEL_ID not configured' }), { status: 500 });
        }

        interface SyncItem {
            id: string;
            text?: string;
            image?: string;
            tgImage?: string;
            tgMessageId?: string;
            [key: string]: unknown;
        }

        // Загружаем элементы
        const items = (await readJsonFile(`${collection}.json`)) as SyncItem[];
        // Handle if readJsonFile returns unknown/any, ensure it is array
        if (!Array.isArray(items)) {
            throw new Error('Invalid collection data');
        }

        const itemIndex = items.findIndex((i) => i.id === id);

        if (itemIndex === -1) {
            return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
        }

        const item = items[itemIndex];

        // 1. Готовим текст
        let caption = '';
        if (collection === 'posts') {
            caption = (item.text as string) || '';
        } else {
            if (collection === 'excursions') caption = formatExcursionCard(item);
            else if (collection === 'transport-items') caption = formatTransportCard(item);
            else if (collection === 'accommodations') caption = formatAccommodationCard(item);
            else if (collection === 'services') caption = formatServiceCard(item);
        }

        if (caption.length > 1024) {
            caption = caption.substring(0, 1020) + '...';
        }

        const warning = '';

        // 2. Фото
        const imagePath = (item.tgImage as string) || (item.image as string);
        if (!imagePath) {
            return new Response(JSON.stringify({ error: 'No image found' }), { status: 400 });
        }

        const imageUrl = getFullImageUrl(imagePath);
        const sanitizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const localPath = path.join(process.cwd(), 'public', sanitizedPath);

        let successMessage = 'Опубликовано!';

        // 3. Отправка/Редактирование
        if (item.tgMessageId) {
            try {
                await bot.telegram.editMessageMedia(channelId, parseInt(item.tgMessageId as string), undefined, {
                    type: 'photo',
                    media: imageUrl,
                    caption: caption,
                    parse_mode: 'Markdown'
                });
                successMessage = 'Обновлено!';
            } catch (editError: unknown) {
                const errorMessage = editError instanceof Error ? editError.message : String(editError);
                if (errorMessage.includes('message is not modified')) {
                    successMessage = 'Без изменений';
                } else {
                    // Fallback to local file upload if URL failed
                    if (fs.existsSync(localPath)) {
                        try {
                            await bot.telegram.editMessageMedia(channelId, parseInt(item.tgMessageId as string), undefined, {
                                type: 'photo',
                                media: { source: localPath },
                                caption: caption,
                                parse_mode: 'Markdown'
                            });
                            successMessage = 'Обновлено (local)!';
                        } catch (fallbackError: unknown) {
                            const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                            if (fallbackMessage.includes('message is not modified')) {
                                successMessage = 'Без изменений';
                            } else {
                                // Last resort: send as new message if edit fails completely
                                const result = await bot.telegram.sendPhoto(channelId, { source: localPath }, {
                                    caption: caption,
                                    parse_mode: 'Markdown'
                                });
                                item.tgMessageId = String(result.message_id);
                                successMessage = 'Отправлено заново (edit failed)';
                            }
                        }
                    } else {
                        throw editError;
                    }
                }
            }
        } else {
            // New Post
            const domain = import.meta.env.WEBHOOK_DOMAIN;
            const hasDomain = !!domain && !domain.includes('localhost');

            try {
                if (!hasDomain) throw new Error('No domain');
                const res = await bot.telegram.sendPhoto(channelId, imageUrl, { caption, parse_mode: 'Markdown' });
                item.tgMessageId = String(res.message_id);
            } catch {
                if (fs.existsSync(localPath)) {
                    const res = await bot.telegram.sendPhoto(channelId, { source: localPath }, { caption, parse_mode: 'Markdown' });
                    item.tgMessageId = String(res.message_id);
                } else {
                    throw new Error('Image not found locally');
                }
            }
        }

        items[itemIndex] = item;
        await writeJsonFile(`${collection}.json`, items);

        return new Response(JSON.stringify({ success: true, message: successMessage, warning }), { status: 200 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error';
        console.error('Sync Error:', msg);
        return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }
};
