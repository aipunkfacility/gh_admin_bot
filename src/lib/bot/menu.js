import { readJsonFile } from './utils.js';
import { logger } from '../logger.js';

/**
 * Shows the main menu to the user.
 * @param {import('telegraf').Context} ctx
 */
export async function showMainMenu(ctx) {
    try {
        const meta = await readJsonFile('site-meta.json');
        const services = await readJsonFile('services.json');

        const isServiceActive = (id) => services.find(s => s.id === id)?.isActive;
        const isSectionEnabled = (id) => meta.sections?.find(s => s.id === id)?.enabled ?? true;

        // console.log('DEBUG: Services loaded:', services.map(s => ({ id: s.id, isActive: s.isActive, title: s.title })));

        const keyboard = [];

        // Define all possible buttons
        const buttons = {
            // Services
            'money-exchange': { text: '💰 Обмен валют', callback_data: 'calc_exchange', active: isServiceActive('money-exchange') },
            'visa-run-cambodia': { text: '🛂 Визаран', callback_data: 'visarun_info', active: isServiceActive('visa-run-cambodia') },
            'transfer-airport-muine': { text: '🚖 Трансфер', callback_data: 'transfer_info', active: isServiceActive('transfer-airport-muine') },

            // Sections
            'transport': { text: '🏍 Аренда байков', callback_data: 'cat_transport', active: isSectionEnabled('transport') },
            'excursions': { text: '🌴 Экскурсии', callback_data: 'cat_excursions', active: isSectionEnabled('excursions') },
            'accommodations': { text: '🏨 Жилье', callback_data: 'cat_accommodations', active: isSectionEnabled('accommodations') },
            'contacts': { text: '📞 Контакты', callback_data: 'contacts', active: isSectionEnabled('contacts') },

            // Static
            'leave_feedback': { text: '📝 Оставить отзыв', callback_data: 'leave_feedback', active: true }
        };

        // Grid Layout
        const layout = [
            ['money-exchange', 'transport'],
            ['transfer-airport-muine', 'visa-run-cambodia'],
            ['excursions', 'accommodations'],
            ['contacts'],
            ['leave_feedback']
        ];

        // Generate Keyboard
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
