import { Scenes } from 'telegraf';
import { readJsonFile } from './utils.js';
import { formatNumber, validateNumberInput } from './utils.js';
import { logger } from '../logger.js';

// ========== КАЛЬКУЛЯТОР ВАЛЮТ (WizardScene) ==========

const exchangeWizard = new Scenes.WizardScene(
    'exchange_calculator',

    // ===== ШАГ 1: Вывод курсов и выбор валюты =====
    async (ctx) => {
        try {
            const rates = await readJsonFile('rates.json');

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
        } catch (error) {
            logger.error('Error in exchange wizard step 1', { error: error.message });
            await ctx.reply('❌ Ошибка загрузки курсов. Попробуйте позже.');
            return ctx.scene.leave();
        }
    },

    // ===== ШАГ 2: Ввод суммы =====
    async (ctx) => {
        // Обработка callback от выбора валюты
        if (ctx.callbackQuery) {
            const action = ctx.callbackQuery.data;

            if (action === 'back_to_menu') {
                await ctx.answerCbQuery();
                return ctx.scene.leave();
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
                await ctx.answerCbQuery('Неизвестная валюта');
                return;
            }

            ctx.scene.session.currency = currency;

            await ctx.answerCbQuery();
            await ctx.reply(`${currency.emoji} Введите сумму в ${currency.name} (только цифры):`);

            return ctx.wizard.next();
        }
    },

    // ===== ШАГ 3: Расчет и результат =====
    async (ctx) => {
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

        try {
            const rates = await readJsonFile('rates.json');
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
        } catch (error) {
            logger.error('Error in exchange wizard step 3', { error: error.message });
            await ctx.reply('❌ Ошибка расчета. Попробуйте позже.');
            return ctx.scene.leave();
        }
    }
);

// Экспорт сцены
export const stage = new Scenes.Stage([exchangeWizard]);
