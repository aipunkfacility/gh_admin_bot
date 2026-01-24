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

        // Загружаем элементы
        const items = await readJsonFile(`${collection}.json`);
        const itemIndex = items.findIndex((i: any) => i.id === id);

        if (itemIndex === -1) {
            return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
        }

        const item = items[itemIndex];

        // 1. Готовим текст - всегда по шаблону для товаров, или по полю text для постов
        let caption = '';
        if (collection === 'posts') {
            caption = item.text || '';
        } else {
            if (collection === 'excursions') caption = formatExcursionCard(item);
            else if (collection === 'transport-items') caption = formatTransportCard(item);
            else if (collection === 'accommodations') caption = formatAccommodationCard(item);
            else if (collection === 'services') caption = formatServiceCard(item);
        }

        // Жесткое усечение для Telegram лимита (1024)
        if (caption.length > 1024) {
            caption = caption.substring(0, 1020) + '...';
        }

        let warning = ''; // Оставляем для совместимости ответа если нужно

        // 2. Готовим фото
        const relativeImagePath = item.tgImage || item.image;
        if (!relativeImagePath) {
            return new Response(JSON.stringify({ error: 'No image found for this item' }), { status: 400 });
        }

        const imageUrl = getFullImageUrl(relativeImagePath);
        // Исправляем путь для Windows: убираем ведущий слэш если он есть
        const sanitizedPath = relativeImagePath.startsWith('/') ? relativeImagePath.slice(1) : relativeImagePath;
        const localPath = path.join(process.cwd(), 'public', sanitizedPath);

        let successMessage = 'Опубликовано в Telegram!';

        // 3. Логика Edit или Send
        if (item.tgMessageId) {
            try {
                // Пытаемся обновить существующий пост через URL
                await bot.telegram.editMessageMedia(channelId, parseInt(item.tgMessageId), undefined, {
                    type: 'photo',
                    media: imageUrl,
                    caption: caption,
                    parse_mode: 'Markdown'
                });
                successMessage = 'Пост в Telegram обновлен!';
            } catch (editError: any) {
                // Если Telegram говорит, что изменений нет - это успех, не нужно слать новый пост
                if (editError.message && editError.message.includes('message is not modified')) {
                    successMessage = 'Пост не изменился (данные совпадают)';
                } else {
                    console.warn('Edit via URL failed, trying local upload:', editError.message);

                    try {
                        // Fallback: пробуем загрузить файл локально если URL не доступен
                        if (fs.existsSync(localPath)) {
                            await bot.telegram.editMessageMedia(channelId, parseInt(item.tgMessageId), undefined, {
                                type: 'photo',
                                media: { source: localPath },
                                caption: caption,
                                parse_mode: 'Markdown'
                            });
                            successMessage = 'Пост обновлен (загружен локально)!';
                        } else {
                            throw new Error(`Файл не найден на диске: ${localPath}`);
                        }
                    } catch (fallbackError: any) {
                        // И тут тоже проверяем на отсутствие изменений
                        if (fallbackError.message && fallbackError.message.includes('message is not modified')) {
                            successMessage = 'Пост не изменился (данные совпадают)';
                        } else {
                            console.error('Final fallback failed:', fallbackError.message);
                            // Если всё равно не вышло - шлем новый (иногда ID сообщения устаревает)
                            if (fs.existsSync(localPath)) {
                                const result = await bot.telegram.sendPhoto(channelId, { source: localPath }, {
                                    caption: caption,
                                    parse_mode: 'Markdown'
                                });
                                item.tgMessageId = String(result.message_id);
                                successMessage = 'Старый пост не изменился, отправлен новый.';
                            } else {
                                throw new Error(`Ошибка при редактировании и фото не найдено локально. Путь: ${relativeImagePath}`);
                            }
                        }
                    }
                }
            }
        } else {
            // Отправляем новый пост. Сначала пробуем URL, если есть домен, иначе локально.
            const hasDomain = !!import.meta.env.WEBHOOK_DOMAIN && !import.meta.env.WEBHOOK_DOMAIN.includes('localhost');

            try {
                if (!hasDomain) throw new Error('No public domain');
                const result = await bot.telegram.sendPhoto(channelId, imageUrl, {
                    caption: caption,
                    parse_mode: 'Markdown'
                });
                item.tgMessageId = String(result.message_id);
            } catch (err: any) {
                console.warn('Upload via URL failed, using local file:', err.message);
                // Если URL не сработал - шлем как файл
                if (fs.existsSync(localPath)) {
                    const result = await bot.telegram.sendPhoto(channelId, { source: localPath }, {
                        caption: caption,
                        parse_mode: 'Markdown'
                    });
                    item.tgMessageId = String(result.message_id);
                } else {
                    throw new Error(`Не удалось отправить по ссылке и файл не найден локально. Путь: ${localPath}. Ошибка URL: ${err.message}`);
                }
            }
        }

        items[itemIndex] = item;
        await writeJsonFile(`${collection}.json`, items);

        return new Response(JSON.stringify({
            success: true,
            message: successMessage,
            warning: warning
        }), { status: 200 });
    } catch (error: any) {
        console.error('SyncChannel API error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
