import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Find .env relative to this file's directory (go up 3 levels from src/lib/bot to project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
dotenv.config({ path: envPath });
import { Telegraf, session } from 'telegraf';
import { stage } from './scenes.js';
import {
    readJsonFile,
    getFullImageUrl,
    paginate,
    formatExcursionCard,
    formatTransportCard,
    formatAccommodationCard,
    escapeMarkdown,
    replyWithImageFallback,
    validateItemId,
    wrapHandler,
    buildPaginationKeyboard
} from './utils.js';
import { logger } from '../logger.js';
import rateLimit from 'telegraf-ratelimit';

// Настройка лимитов (защита от флуда)
const limitConfig = {
    window: 1000,
    limit: 1,
    onLimitExceeded: (_ctx) => {
        if (_ctx.callbackQuery) {
            return _ctx.answerCbQuery('⚠️ Слишком быстро! Пожалуйста, подождите.').catch(() => { });
        }
    }
};

// Инициализация бота
let token;
try {
    token = import.meta.env.TELEGRAM_BOT_TOKEN;
} catch {
    // import.meta.env не существует в чистом Node.js
}
token = token || process.env.TELEGRAM_BOT_TOKEN;

if (!token) throw new Error('Bot Token is required');
const bot = new Telegraf(token);

// Middleware
bot.use(session());
bot.use(rateLimit(limitConfig));
bot.use(stage.middleware());

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

async function showMainMenu(ctx) {
    try {
        const meta = await readJsonFile('site-meta.json');
        const services = await readJsonFile('services.json');

        const isServiceActive = (id) => services.find(s => s.id === id)?.isActive;
        const isSectionEnabled = (id) => meta.sections?.find(s => s.id === id)?.enabled ?? true;

        const keyboard = [];

        // Определяем все возможные кнопки
        const buttons = {
            // Services
            'money-exchange': { text: '💰 Обмен валют', callback_data: 'calc_exchange', active: isServiceActive('money-exchange') },
            'visa-run': { text: '🛂 Визаран', callback_data: 'visarun_info', active: isServiceActive('visa-run') },
            'transfer': { text: '🚖 Трансфер', callback_data: 'transfer_info', active: isServiceActive('transfer') },

            // Sections
            'transport': { text: '🏍 Аренда байков', callback_data: 'cat_transport', active: isSectionEnabled('transport') },
            'excursions': { text: '🌴 Экскурсии', callback_data: 'cat_excursions', active: isSectionEnabled('excursions') },
            'accommodations': { text: '🏨 Жилье', callback_data: 'cat_accommodations', active: isSectionEnabled('accommodations') },
            'contacts': { text: '📞 Контакты', callback_data: 'contacts', active: isSectionEnabled('contacts') },

            // Static
            'leave_feedback': { text: '📝 Оставить отзыв', callback_data: 'leave_feedback', active: true }
        };

        // Макет сетки (Grid Layout)
        const layout = [
            ['money-exchange', 'transport'],
            ['transfer', 'visa-run'],
            ['excursions', 'accommodations'],
            ['contacts'],
            ['leave_feedback']
        ];

        // Генерация клавиатуры по макету
        for (const rowIds of layout) {
            const row = [];
            for (const id of rowIds) {
                const btn = buttons[id];
                if (btn && btn.active) {
                    row.push({ text: btn.text, callback_data: btn.callback_data });
                }
            }
            if (row.length > 0) keyboard.push(row);
        }

        const message = `👋 Добро пожаловать в Green Hill Tours!

Выберите интересующий раздел:`;

        await ctx.reply(message, {
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    } catch (error) {
        logger.error('Error in showMainMenu', { error: error.message });
        await ctx.reply('👋 Добро пожаловать!');
    }
}


// ========== КОМАНДА /START ==========
bot.command('start', wrapHandler('start', async (ctx) => {
    ctx.session = ctx.session || {};
    await showMainMenu(ctx);
}));

// ========== КОМАНДА /MENU ==========
bot.command('menu', wrapHandler('menu', async (ctx) => {
    await showMainMenu(ctx);
}));

// Устанавливаем команды бота (появятся в меню рядом с полем ввода)
// Команды устанавливаются при запуске (см. scripts/poll.js)


// ========== НАЗАД В МЕНЮ ==========
bot.action('back_to_start', wrapHandler('back_to_start', async (ctx) => {
    await showMainMenu(ctx);
}));

bot.action('noop', wrapHandler('noop', async () => {
    // Ничего не делаем, wrapper сам ответит на query
}));

// ========== ТРАНСПОРТ ==========

bot.action('cat_transport', wrapHandler('cat_transport', async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.transportCategory = null;

    try {
        const categories = await readJsonFile('transport-categories.json');

        await ctx.reply('🏍 Выберите категорию транспорта:', {
            reply_markup: {
                inline_keyboard: [
                    ...categories.map(cat => [{ text: cat.badgeTitle || cat.title, callback_data: `transport_cat_${cat.id}` }]),
                    [{ text: '📋 Все категории', callback_data: 'transport_all_1' }],
                    [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                ],
            },
        });
    } catch (error) {
        logger.error('Error loading transport categories', { error: error.message });
        await ctx.reply('❌ Ошибка загрузки категорий.');
    }
}));

// Выбор категории транспорта
bot.action(/^transport_cat_(.+)$/, wrapHandler('transport_cat', async (ctx) => {
    const categoryId = ctx.match[1];
    ctx.session = ctx.session || {};
    ctx.session.transportCategory = categoryId;

    await showTransportList(ctx, 1, categoryId);
}));

// Все категории транспорта с пагинацией
bot.action(/^transport_all_(\d+)$/, wrapHandler('transport_all', async (ctx) => {
    const page = parseInt(ctx.match[1]);
    ctx.session = ctx.session || {};
    ctx.session.transportCategory = null;

    await showTransportList(ctx, page, null);
}));

// Пагинация транспорта по категории
bot.action(/^transport_page_(\d+)$/, wrapHandler('transport_page', async (ctx) => {
    const page = parseInt(ctx.match[1]);
    const category = ctx.session?.transportCategory || null;

    await showTransportList(ctx, page, category);
}));

async function showTransportList(ctx, page, categoryId) {
    try {
        let items = await readJsonFile('transport-items.json');
        // Строгая проверка на активность
        items = items.filter(i => i.isActive === true);

        if (categoryId) {
            items = items.filter(i => i.categoryId === categoryId);
        }

        if (!items || items.length === 0) {
            await ctx.reply('🔍 Транспорт не найден.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '◀️ Назад к категориям', callback_data: 'cat_transport' }],
                        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                    ],
                },
            });
            return;
        }

        const { items: pageItems, currentPage, totalPages, hasNext, hasPrev } = paginate(items, page, 3);

        const categoryName = categoryId
            ? (await readJsonFile('transport-categories.json')).find(c => c.id === categoryId)?.title || 'Транспорт'
            : '🏍 Весь транспорт';

        await ctx.reply(`${categoryName} (${currentPage}/${totalPages}):`);

        for (const item of pageItems) {
            const imageUrl = getFullImageUrl(item.image);
            const caption = `🏍 *${escapeMarkdown(item.title)}*\n\n${escapeMarkdown(item.useCases || '')}\n\n💰 ${escapeMarkdown(item.pricePerDay || 'уточняйте')}/день`;

            const keyboard = [
                [{ text: '📋 Подробнее', callback_data: `transport_detail_${item.id}` }],
                [{ text: '✅ Забронировать', callback_data: `book_transport_${item.id}` }],
            ];

            try {
                await ctx.replyWithPhoto(imageUrl, {
                    caption,
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: keyboard },
                });
            } catch {
                await ctx.reply(caption, {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: keyboard },
                });
            }
        }

        // Навигация (Новая система!)
        const navButtons = buildPaginationKeyboard('transport', { currentPage, totalPages, hasNext, hasPrev }, [
            { text: '◀️ Назад к категориям', callback_data: 'cat_transport' },
            { text: '🏠 Главное меню', callback_data: 'back_to_start' }
        ]);

        if (navButtons.length > 0) {
            await ctx.reply('📄 Управление списком:', {
                reply_markup: { inline_keyboard: navButtons },
            });
        }

    } catch (error) {
        logger.error('Error loading transport', { error: error.message, stack: error.stack });
        await ctx.reply('❌ Ошибка загрузки транспорта.');
    }
}

// Детали транспорта
bot.action(/^transport_detail_(.+)$/, wrapHandler('transport_detail', async (ctx) => {
    const itemId = ctx.match[1];

    // Валидация
    if (!validateItemId(itemId)) {
        logger.warn('Invalid itemId in transport_detail', { itemId, userId: ctx.from.id });
        await ctx.reply('❌ Некорректный запрос.');
        return;
    }

    try {
        const items = await readJsonFile('transport-items.json');
        const item = items.find(i => i.id === itemId);

        if (!item || item.isActive === false) {
            await ctx.reply('❌ К сожалению, этот товар сейчас недоступен.');
            return;
        }

        const text = formatTransportCard(item);

        if (item.image) {
            const imageUrl = getFullImageUrl(item.tgImage || item.image);
            const buttons = [
                [{ text: '✅ Забронировать', callback_data: `book_transport_${item.id}` }],
                [{ text: '◀️ Назад к списку', callback_data: 'transport_page_1' }],
                [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
            ];
            await replyWithImageFallback(ctx, imageUrl, text, buttons);
        } else {
            await ctx.reply(text, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Забронировать', callback_data: `book_transport_${item.id}` }],
                        [{ text: '◀️ Назад к списку', callback_data: 'transport_page_1' }],
                        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                    ],
                },
            });
        }
    } catch (error) {
        logger.error('Error loading transport detail', { error: error.message, itemId: ctx.match?.[1] });
        await ctx.reply('❌ Ошибка загрузки.');
    }
}));

// ========== ЭКСКУРСИИ ==========

bot.action('cat_excursions', wrapHandler('cat_excursions', async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.excursionCategory = null;

    try {
        const categories = await readJsonFile('excursion-categories.json');

        await ctx.reply('🌴 Выберите категорию экскурсий:', {
            reply_markup: {
                inline_keyboard: [
                    ...categories.map(cat => [{ text: cat.title, callback_data: `excursion_cat_${cat.id}` }]),
                    [{ text: '📋 Все экскурсии', callback_data: 'excursions_all_1' }],
                    [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                ],
            },
        });
    } catch (error) {
        logger.error('Error loading excursion categories', { error: error.message });
        await ctx.reply('❌ Ошибка загрузки категорий.');
    }
}));

// Выбор категории экскурсий
bot.action(/^excursion_cat_(.+)$/, wrapHandler('excursion_cat', async (ctx) => {
    const categoryId = ctx.match[1];
    ctx.session = ctx.session || {};
    ctx.session.excursionCategory = categoryId;

    await showExcursionsList(ctx, 1, categoryId);
}));

// Все экскурсии с пагинацией
bot.action(/^excursions_all_(\d+)$/, wrapHandler('excursions_all', async (ctx) => {
    const page = parseInt(ctx.match[1]);
    ctx.session = ctx.session || {};
    ctx.session.excursionCategory = null;

    await showExcursionsList(ctx, page, null);
}));

// Пагинация экскурсий по категории
bot.action(/^excursions_page_(\d+)$/, wrapHandler('excursions_page', async (ctx) => {
    const page = parseInt(ctx.match[1]);
    const category = ctx.session?.excursionCategory || null;

    await showExcursionsList(ctx, page, category);
}));

async function showExcursionsList(ctx, page, categoryId) {
    try {
        let items = await readJsonFile('excursions.json');
        items = items.filter(i => i.isActive === true);

        if (categoryId) {
            items = items.filter(i => i.categoryId === categoryId);
        }

        if (!items || items.length === 0) {
            await ctx.reply('🔍 Экскурсии не найдены.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '◀️ Назад к категориям', callback_data: 'cat_excursions' }],
                        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                    ],
                },
            });
            return;
        }

        const { items: pageItems, currentPage, totalPages, hasNext, hasPrev } = paginate(items, page, 3);

        const categoryName = categoryId
            ? (await readJsonFile('excursion-categories.json')).find(c => c.id === categoryId)?.title || 'Экскурсии'
            : '🌴 Все экскурсии';

        await ctx.reply(`${categoryName} (${currentPage}/${totalPages}):`);

        for (const item of pageItems) {
            const caption = `🌴 *${escapeMarkdown(item.title)}*\n\n${escapeMarkdown(item.shortDescription || '')}\n\n💰 ${escapeMarkdown(item.priceFrom || 'уточняйте')}`;

            const keyboard = [
                [{ text: '📋 Подробнее', callback_data: `excursion_detail_${item.id}` }],
                [{ text: '✅ Забронировать', callback_data: `book_excursion_${item.id}` }],
            ];

            await ctx.reply(caption, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard },
            });
        }

        // Навигация (Новая система!)
        const navButtons = buildPaginationKeyboard('excursions', { currentPage, totalPages, hasNext, hasPrev }, [
            { text: '◀️ Назад к категориям', callback_data: 'cat_excursions' },
            { text: '🏠 Главное меню', callback_data: 'back_to_start' }
        ]);

        await ctx.reply('📄 Управление списком:', {
            reply_markup: { inline_keyboard: navButtons },
        });

    } catch (error) {
        logger.error('Error loading excursions', { error: error.message });
        await ctx.reply('❌ Ошибка загрузки экскурсий.');
    }
}

// Детали экскурсии
bot.action(/^excursion_detail_(.+)$/, wrapHandler('excursion_detail', async (ctx) => {
    const itemId = ctx.match[1];

    // Валидация
    if (!validateItemId(itemId)) {
        logger.warn('Invalid itemId in excursion_detail', { itemId, userId: ctx.from.id });
        await ctx.reply('❌ Некорректный запрос.');
        return;
    }

    try {
        const items = await readJsonFile('excursions.json');
        const item = items.find(i => i.id === itemId);

        if (!item || item.isActive === false) {
            await ctx.reply('❌ К сожалению, эта экскурсия сейчас недоступна.');
            return;
        }

        const text = formatExcursionCard(item);

        if (item.image) {
            const imageUrl = getFullImageUrl(item.tgImage || item.image);
            const buttons = [
                [{ text: '✅ Забронировать', callback_data: `book_excursion_${item.id}` }],
                [{ text: '◀️ Назад к списку', callback_data: 'excursions_page_1' }],
                [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
            ];
            await replyWithImageFallback(ctx, imageUrl, text, buttons);
        } else {
            await ctx.reply(text, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Забронировать', callback_data: `book_excursion_${item.id}` }],
                        [{ text: '◀️ Назад к списку', callback_data: 'excursions_page_1' }],
                        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                    ],
                },
            });
        }
    } catch (error) {
        logger.error('Error loading excursion detail', { error: error.message, itemId: ctx.match?.[1] });
        await ctx.reply('❌ Ошибка загрузки.');
    }
}));

// ========== ЖИЛЬЕ ==========

bot.action('cat_accommodations', wrapHandler('cat_accommodations', async (ctx) => {
    await showAccommodationsList(ctx, 1);
}));

// Поддержка старого callback для совместимости
bot.action('accommodation_menu', wrapHandler('accommodation_menu', async (ctx) => {
    await showAccommodationsList(ctx, 1);
}));

bot.action(/^accommodations_page_(\d+)$/, wrapHandler('accommodations_page', async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await showAccommodationsList(ctx, page);
}));

async function showAccommodationsList(ctx, page) {
    try {
        let items = await readJsonFile('accommodations.json');
        items = items.filter(i => i.isActive === true);

        if (!items || items.length === 0) {
            await ctx.reply('🔍 Жилье временно недоступно.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                    ],
                },
            });
            return;
        }

        const { items: pageItems, currentPage, totalPages, hasNext, hasPrev } = paginate(items, page, 3);

        await ctx.reply(`🏨 Жилье (${currentPage}/${totalPages}):`);

        for (const item of pageItems) {
            const caption = `🏨 *${escapeMarkdown(item.title)}*\n\n${escapeMarkdown(item.slogan || '')}\n\n📍 ${escapeMarkdown(item.address || '')}`;

            const keyboard = [
                [{ text: '📋 Подробнее', callback_data: `accommodation_detail_${item.id}` }],
                [{ text: '✅ Забронировать', callback_data: `book_accommodation_${item.id}` }],
            ];

            await ctx.reply(caption, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard },
            });
        }

        // Навигация (Новая система!)
        const navButtons = buildPaginationKeyboard('accommodations', { currentPage, totalPages, hasNext, hasPrev }, [
            { text: '🏠 Главное меню', callback_data: 'back_to_start' }
        ]);

        await ctx.reply('📄 Навигация:', {
            reply_markup: { inline_keyboard: navButtons },
        });

    } catch (error) {
        logger.error('Error loading accommodations', { error: error.message });
        await ctx.reply('❌ Ошибка загрузки жилья.');
    }
}

// Детали жилья
bot.action(/^accommodation_detail_(.+)$/, wrapHandler('accommodation_detail', async (ctx) => {
    const itemId = ctx.match[1];

    // Валидация
    if (!validateItemId(itemId)) {
        logger.warn('Invalid itemId in accommodation_detail', { itemId, userId: ctx.from.id });
        await ctx.reply('❌ Некорректный запрос.');
        return;
    }

    try {
        const items = await readJsonFile('accommodations.json');
        const item = items.find(i => i.id === itemId);

        if (!item || item.isActive === false) {
            await ctx.reply('❌ К сожалению, это жилье сейчас недоступно.');
            return;
        }

        const text = formatAccommodationCard(item);
        const imageUrl = getFullImageUrl(item.tgImage || item.image);
        const buttons = [
            [{ text: '✅ Забронировать', callback_data: `book_accommodation_${item.id}` }],
            [{ text: '◀️ Назад к списку', callback_data: 'accommodations_page_1' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
        ];
        await replyWithImageFallback(ctx, imageUrl, text, buttons);
    } catch (error) {
        logger.error('Error loading accommodation detail', { error: error.message, itemId: ctx.match?.[1] });
        await ctx.reply('❌ Ошибка загрузки.');
    }
}));

// ========== ИНФОРМАЦИОННЫЕ РАЗДЕЛЫ ==========

// Визаран
bot.action('visarun_info', wrapHandler('visarun_info', async (ctx) => {
    const services = await readJsonFile('services.json');
    const service = services.find(s => s.id === 'visa-run');

    if (!service || !service.isActive) {
        return ctx.reply('❌ Эта услуга временно недоступна.');
    }

    const imageUrl = getFullImageUrl(service.tgImage || service.image);
    const text = `🛂 *Визаран*

Поможем с оформлением визаранов во Вьетнаме.

✅ *Что включено:*
• Трансфер туда-обратно
• Оформление Е-визы во Вьетнам
• Оформление Е-визы в Камбоджу

⏰ *Тайминг:*
• Выезд: 02:30
• Возвращение: 16:00–17:00

Для бронирования нажмите кнопку ниже!`;

    const buttons = [
        [{ text: '✅ Забронировать', callback_data: 'book_visarun' }],
        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
    ];

    await replyWithImageFallback(ctx, imageUrl, text, buttons);
}));

// Трансфер
bot.action('transfer_info', wrapHandler('transfer_info', async (ctx) => {
    const services = await readJsonFile('services.json');
    const service = services.find(s => s.id === 'transfer');

    if (!service || !service.isActive) {
        return ctx.reply('❌ Эта услуга временно недоступна.');
    }

    const imageUrl = getFullImageUrl(service.tgImage || service.image);
    const text = `🚖 *Трасфер*

Организуем трансферы по всему Вьетнаму.

🚘 *Автомобиль:* Toyota Fortuner (7 мест)

✅ *Включено:*
• Встреча с табличкой
• Платные дороги
• Вода в салоне

📍 *Направления:*
• Аэропорт Хошимин (SGN)
• Нячанг / Камрань

Для бронирования нажмите кнопку ниже!`;

    const buttons = [
        [{ text: '✅ Забронировать', callback_data: 'book_transfer' }],
        [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
    ];

    await replyWithImageFallback(ctx, imageUrl, text, buttons);
}));

// Контакты
bot.action('contacts', wrapHandler('contacts', async (ctx) => {
    await ctx.reply(`📞 *Наши контакты:*

🌐 Сайт: greenhilltours.com
📱 Telegram: @greenhilltours
📧 Email: info@greenhilltours.com

Мы всегда на связи!`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
            ],
        },
    });
}));

// Калькулятор валют
bot.action('calc_exchange', wrapHandler('calc_exchange', async (ctx) => {
    const services = await readJsonFile('services.json');
    const service = services.find(s => s.id === 'money-exchange');

    if (!service || !service.isActive) {
        return ctx.reply('❌ Эта услуга временно недоступна.');
    }
    return ctx.scene.enter('exchange_calculator');
}));

// ========== БРОНИРОВАНИЕ ==========

// Бронирование обмена валют
bot.action('book_exchange', wrapHandler('book_exchange', async (ctx) => {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userId = ctx.from.id;

    const calculation = ctx.scene?.session?.calculation || ctx.session?.calculation;

    if (!calculation) {
        await ctx.reply('❌ Данные расчета не найдены. Попробуйте заново.');
        return;
    }

    const bookingMessage = `🔔 НОВАЯ ЗАЯВКА - ОБМЕН ВАЛЮТ

👤 Пользователь: ${escapeMarkdown(username || 'Неизвестно')} (ID: ${userId})
💱 Операция: ${escapeMarkdown(String(calculation.amount))} ${escapeMarkdown(calculation.currency)} → ${escapeMarkdown(String(calculation.result))} VND

Свяжитесь с клиентом для подтверждения!`;

    try {
        let admins = [];
        try {
            admins = await readJsonFile('admins.json');
        } catch (err) {
            logger.warn('admins.json not found, using fallback', { error: err.message });
            const fallbackAdmin = process.env.TELEGRAM_CHANNEL_ID;
            if (fallbackAdmin) {
                admins = [fallbackAdmin];
            }
        }

        if (admins.length === 0) {
            logger.warn('No admins configured for notifications');
            await ctx.reply('⚠️ Заявка не может быть отправлена. Свяжитесь с поддержкой.');
            return;
        }

        for (const adminId of admins) {
            try {
                await ctx.telegram.sendMessage(adminId, bookingMessage);
            } catch (error) {
                logger.error('Failed to notify admin', { adminId, error: error.message });
            }
        }

        await ctx.reply('✅ Ваша заявка принята! Мы свяжемся с вами в ближайшее время.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                ],
            },
        });
    } catch (error) {
        logger.error('Error in booking', { error: error.message });
        await ctx.reply('❌ Ошибка отправки заявки. Попробуйте позже.');
    }
}));

// Бронирование визарана
bot.action('book_visarun', wrapHandler('book_visarun', async (ctx) => {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userId = ctx.from.id;

    const bookingMessage = `🔔 НОВАЯ ЗАЯВКА - ВИЗАРАН

👤 Пользователь: ${username} (ID: ${userId})
📦 Услуга: Визаран в Камбоджу

Свяжитесь с клиентом для подтверждения!`;

    await sendBookingNotification(ctx, bookingMessage);
}));

// Бронирование трансфера
bot.action('book_transfer', wrapHandler('book_transfer', async (ctx) => {
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userId = ctx.from.id;

    const bookingMessage = `🔔 НОВАЯ ЗАЯВКА - ТРАНСФЕР

👤 Пользователь: ${username} (ID: ${userId})
📦 Услуга: Трансфер

Свяжитесь с клиентом для подтверждения!`;

    await sendBookingNotification(ctx, bookingMessage);
}));

// Общий обработчик бронирования товаров
bot.action(/^book_(transport|excursion|accommodation)_(.+)$/, wrapHandler('book_item', async (ctx) => {
    const match = ctx.match;
    const type = match[1];
    const itemId = match[2];

    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userId = ctx.from.id;

    const typeNames = {
        transport: 'Транспорт',
        excursion: 'Экскурсия',
        accommodation: 'Жилье',
    };

    // Получаем название товара
    let itemName = itemId;
    try {
        const files = {
            transport: 'transport-items.json',
            excursion: 'excursions.json',
            accommodation: 'accommodations.json',
        };
        const items = await readJsonFile(files[type]);
        const item = items.find(i => i.id === itemId);
        if (item) {
            if (item.isActive === false) {
                await ctx.reply('❌ К сожалению, этот товар более недоступен для бронирования.');
                return;
            }
            itemName = item.title;
        }
    } catch {
        // Используем ID если не удалось найти название
    }

    const bookingMessage = `🔔 НОВАЯ ЗАЯВКА

👤 Пользователь: ${username} (ID: ${userId})
📦 Тип: ${typeNames[type]}
🏷 Товар: ${itemName}

Свяжитесь с клиентом для подтверждения!`;

    await sendBookingNotification(ctx, bookingMessage);
}));

async function sendBookingNotification(ctx, bookingMessage) {
    try {
        const admins = await readJsonFile('admins.json');

        for (const adminId of admins) {
            try {
                await ctx.telegram.sendMessage(adminId, bookingMessage);
            } catch (error) {
                logger.error('Failed to notify admin', { adminId, error: error.message });
            }
        }

        await ctx.reply('✅ Ваша заявка принята! Мы свяжемся с вами в ближайшее время.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏠 Главное меню', callback_data: 'back_to_start' }],
                ],
            },
        });
    } catch (error) {
        logger.error('Error in booking notification', { error: error.message });
        await ctx.reply('❌ Ошибка отправки заявки. Попробуйте позже.');
    }
}

// Обработка "Назад в меню" из сцены
bot.action('back_to_menu', wrapHandler('back_to_menu', async (ctx) => {
    await ctx.scene.leave();
    await showMainMenu(ctx);
}));

// ========== ОБРАБОТЧИК ОШИБОК ==========
bot.catch((err, ctx) => {
    logger.error('Bot error', { error: err.message, stack: err.stack, userId: ctx?.from?.id });
    ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
});

// Экспорт экземпляра бота
export { bot };
