import { Scenes } from 'telegraf';
import { getCollection } from './utils.js';
import { formatNumber, validateNumberInput, wrapHandler } from './utils.js';
import { showMainMenu } from './menu.js';

// ========== КАЛЬКУЛЯТОР ВАЛЮТ (WizardScene) ==========


const exchangeWizard = new Scenes.WizardScene(
    'exchange_calculator',

    // ===== ШАГ 1: Вывод курсов и выбор валюты =====
    wrapHandler('exchange_step1', async (ctx) => {
        const rates = await getCollection('rates');

        const message = `💱 КУРС ВАЛЮТ НА СЕГОДНЯ:

🇷🇺 1 ₽ ➔ ${formatNumber(rates.rub_rate)} ₫
💎 1 USDT ➔ ${formatNumber(rates.usdt_rate)} ₫
💵 1 USD ➔ ${formatNumber(rates.usd_rate)} ₫
🇪🇺 1 EUR ➔ ${formatNumber(rates.eur_rate)} ₫
🇨🇳 1 CNY ➔ ${formatNumber(rates.cny_rate)} ₫

👇 Что будем менять?`;

        await ctx.reply(message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🇷🇺 RUB', callback_data: 'calc_rub' },
                        { text: '💎 USDT', callback_data: 'calc_usdt' },
                    ],
                    [
                        { text: '💵 USD', callback_data: 'calc_usd' },
                        { text: '🇪🇺 EUR', callback_data: 'calc_eur' },
                    ],
                    [
                        { text: '🇨🇳 CNY', callback_data: 'calc_cny' },
                    ],
                    [
                        { text: '◀️ Назад', callback_data: 'back_to_menu' },
                    ],
                ],
            },
        });

        return ctx.wizard.next();
    }),

    // ===== ШАГ 2: Ввод суммы =====
    wrapHandler('exchange_step2', async (ctx) => {
        // Обработка callback от выбора валюты
        if (ctx.callbackQuery) {
            const action = ctx.callbackQuery.data;

            if (action === 'back_to_menu') {
                await ctx.scene.leave();
                return showMainMenu(ctx);
            }

            // Сохраняем выбранную валюту
            const currencyMap = {
                'calc_rub': { code: 'RUB', name: 'Рублях', emoji: '🇷🇺', key: 'rub_rate' },
                'calc_usdt': { code: 'USDT', name: 'USDT', emoji: '💎', key: 'usdt_rate' },
                'calc_usd': { code: 'USD', name: 'Долларах', emoji: '💵', key: 'usd_rate' },
                'calc_eur': { code: 'EUR', name: 'Евро', emoji: '🇪🇺', key: 'eur_rate' },
                'calc_cny': { code: 'CNY', name: 'Юанях', emoji: '🇨🇳', key: 'cny_rate' },
            };

            const currency = currencyMap[action];

            if (!currency) {
                return;
            }

            ctx.scene.session.currency = currency;
            await ctx.reply(`${currency.emoji} Введите сумму в ${currency.name} (только цифры):`);
            return ctx.wizard.next();
        }
    }),

    // ===== ШАГ 3: Расчет и результат =====
    wrapHandler('exchange_step3', async (ctx) => {
        if (!ctx.message || !ctx.message.text) {
            await ctx.reply('⚠️ Пожалуйста, введите число.');
            return;
        }

        const input = ctx.message.text;
        const amount = validateNumberInput(input);

        if (!amount) {
            await ctx.reply('❌ Неверный формат. Введите только цифры (например: 5000 или 5 000):');
            return;
        }

        // Лимит на сумму
        if (amount > 100_000_000) {
            await ctx.reply('⚠️ Максимальная сумма для обмена: 100 000 000. Введите меньшую сумму:');
            return;
        }

        const currency = ctx.scene.session.currency;

        if (!currency) {
            await ctx.reply('❌ Ошибка сессии. Начните заново.');
            return ctx.scene.leave();
        }

        const rates = await getCollection('rates');
        const rate = rates[currency.key];
        const result = amount * rate;

        // Доп. информация
        let additionalInfo = '';
        if (currency.code === 'RUB') {
            additionalInfo = '\n\n✅ Принимаем: Сбер, СБП.';
        } else {
            additionalInfo = '\n\n💵 Выдаем наличные VND.';
        }

        const message = `💰 Расчет:
${formatNumber(amount)} ${currency.code} = ${formatNumber(result)} VND${additionalInfo}`;

        // Сохраняем данные расчета для бронирования
        ctx.scene.session.calculation = {
            amount,
            currency: currency.code,
            result,
        };

        // ВАЖНО: Сохраняем в основную сессию, т.к. scene.session очистится после leave()
        ctx.session = ctx.session || {};
        ctx.session.calculation = ctx.scene.session.calculation;

        await ctx.reply(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✅ Забронировать обмен', callback_data: 'book_exchange' }],
                    [{ text: '◀️ В меню', callback_data: 'back_to_menu' }],
                ],
            },
        });

        return ctx.scene.leave();
    })
);

// ========== ОТЗЫВЫ (WizardScene) ==========

const feedbackWizard = new Scenes.WizardScene(
    'feedback_wizard',

    // ===== ШАГ 1: Запрос отзыва =====
    wrapHandler('feedback_step1', async (ctx) => {
        await ctx.reply('📝 Напишите ваш отзыв или предложение одним сообщением:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '❌ Отмена', callback_data: 'cancel_feedback' }],
                ],
            },
        });
        return ctx.wizard.next();
    }),

    // ===== ШАГ 2: Обработка и отправка =====
    wrapHandler('feedback_step2', async (ctx) => {
        if (ctx.callbackQuery && ctx.callbackQuery.data === 'cancel_feedback') {
            await ctx.reply('❌ Оставление отзыва отменено.');
            return ctx.scene.leave();
        }

        if (!ctx.message || !ctx.message.text) {
            await ctx.reply('⚠️ Пожалуйста, отправьте текстовое сообщение.');
            return;
        }

        const feedbackText = ctx.message.text;
        const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
        const userId = ctx.from.id;

        const adminMessage = `📝 НОВЫЙ ОТЗЫВ
        
👤 От: ${username} (ID: ${userId})
💬 Текст:
${feedbackText}`;

        try {
            // Отправка админам 
            const adminEnv = process.env.TELEGRAM_ADMIN_IDS || '';
            const admins = adminEnv.split(',').map(id => id.trim()).filter(Boolean);

            // Fallback
            if (admins.length === 0 && process.env.TELEGRAM_CHANNEL_ID) {
                admins.push(process.env.TELEGRAM_CHANNEL_ID);
            }

            for (const adminId of admins) {
                await ctx.telegram.sendMessage(adminId, adminMessage).catch(err => console.error('Failed to send feedback to admin:', err));
            }

            await ctx.reply('✅ Спасибо большое! Ваш отзыв отправлен команде Green Hill Tours. Нам важно ваше мнение!', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }],
                    ],
                },
            });
        } catch (error) {
            console.error('Error sending feedback:', error);
            await ctx.reply('❌ Произошла ошибка при отправке. Попробуйте позже.');
        }

        return ctx.scene.leave();
    })
);


// Экспорт сцены
export const stage = new Scenes.Stage([exchangeWizard, feedbackWizard]);
