import { bot } from '../../../lib/bot/index.js';
import { getItem, saveItem } from '../../../lib/data-store.js';
import path from 'path';

export const prerender = false;

export async function POST({ request, cookies }) {
    // Проверка авторизации
    const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;
    const isAuth = ADMIN_PASSWORD && cookies.get('gh_admin_auth')?.value === ADMIN_PASSWORD;

    if (!isAuth) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { collection, id } = await request.json();

        // Получение товара
        const item = await getItem(`${collection}.json`, id);

        if (!item) {
            return new Response(JSON.stringify({ error: 'Item not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Подготовка данных для отправки
        // Строим абсолютный путь к картинке на диске
        const publicDir = path.join(process.cwd(), 'public');
        // Убираем начальный слеш из пути картинки, если он есть
        const imagePathRelative = item.image.startsWith('/') ? item.image.slice(1) : item.image;
        const photoSource = { source: path.join(publicDir, imagePathRelative) };

        // Формирование умного описания в зависимости от наличия полей
        let caption = `<b>${item.title}</b>\n\n`;

        // Для транспорта
        if (item.categoryId) {
            const catNames = { standard: 'Стандарт', comfort: 'Комфорт', maxi: 'Макси', moto: 'Мотоцикл', car: 'Авто' };
            caption += `🏎 <b>Категория:</b> ${catNames[item.categoryId] || item.categoryId}\n`;
        }

        // Для жилья
        if (item.type) {
            const typeNames = { hotel: 'Отель', villa: 'Вилла', apartment: 'Апартаменты', guesthouse: 'Гостевой дом' };
            caption += `🏠 <b>Тип:</b> ${typeNames[item.type] || item.type}\n`;
        }

        if (item.duration) caption += `⏱ <b>Длительность:</b> ${item.duration}\n`;
        if (item.slogan) caption += `<i>"${item.slogan}"</i>\n`;

        caption += `\n`;

        if (item.shortDescription) caption += `${item.shortDescription}\n\n`;
        if (item.useCases) caption += `${item.useCases}\n\n`;

        if (item.specs && Array.isArray(item.specs) && item.specs.length > 0) {
            caption += `⚙️ <b>Характеристики:</b>\n`;
            item.specs.forEach(spec => caption += `• ${spec}\n`);
            caption += `\n`;
        }

        if (item.benefits && Array.isArray(item.benefits) && item.benefits.length > 0) {
            caption += `✅ <b>Преимущества:</b>\n`;
            item.benefits.forEach(ben => caption += `• ${ben}\n`);
            caption += `\n`;
        }

        if (item.roomFeatures && Array.isArray(item.roomFeatures) && item.roomFeatures.length > 0) {
            caption += `🛏 <b>Особенности:</b>\n`;
            item.roomFeatures.forEach(feat => caption += `• ${feat}\n`);
            caption += `\n`;
        }

        if (item.territoryDescription) caption += `🌳 <b>Территория:</b>\n${item.territoryDescription}\n\n`;
        if (item.atmosphere) caption += `✨ <b>Атмосфера:</b>\n${item.atmosphere}\n\n`;

        if (item.details) {
            // Очистка HTML тегов если они есть, так как Telegram поддерживает ограниченный набор
            const cleanDetails = item.details.replace(/<[^>]*>?/gm, '');
            caption += `${cleanDetails}\n\n`;
        }

        // Цена (поддержка разных полей цены)
        const price = item.price || item.priceFrom;
        if (price) {
            caption += `💰 <b>Цена: ${price}</b>`;
        }

        console.log('DEBUG CAPTION:', caption); // Лог для проверки текста

        // ID канала (из переменной окружения)
        const channelId = import.meta.env.TELEGRAM_CHANNEL_ID;

        if (!channelId) {
            return new Response(JSON.stringify({ error: 'TELEGRAM_CHANNEL_ID not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let messageId;

        // Вспомогательная функция для отправки фото
        const sendPhotoToChannel = async () => {
            return await bot.telegram.sendPhoto(channelId, photoSource, { caption, parse_mode: 'HTML' });
        }

        if (item.tg_message_id) {
            // Обновление существующего поста
            try {
                // Пытаемся обновить только текст
                await bot.telegram.editMessageCaption(
                    channelId,
                    item.tg_message_id,
                    undefined,
                    caption,
                    { parse_mode: 'HTML' }
                );
                messageId = item.tg_message_id;
            } catch (error) {
                console.error('Error editing message, creating new one:', error);
                // Если сообщение не найдено или устарело, создаем новое с нуля
                const msg = await sendPhotoToChannel();
                messageId = msg.message_id;
            }
        } else {
            // Создание нового поста
            const msg = await sendPhotoToChannel();
            messageId = msg.message_id;
        }

        // Сохранение message_id в JSON
        item.tg_message_id = messageId;
        await saveItem(`${collection}.json`, id, item);

        return new Response(JSON.stringify({ success: true, messageId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Sync channel error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
