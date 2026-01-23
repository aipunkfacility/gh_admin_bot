import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Find .env relative to this file's directory (go up 2 levels: scripts -> project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import { bot } from '../src/lib/bot/index.js';

console.log('---');
console.log('🚀 Бот запущен в режиме Long Polling (VPS/Local)...');
console.log('---');

// Set commands on launch
bot.telegram.setMyCommands([
    { command: 'start', description: 'Запустить бота' },
    { command: 'menu', description: 'Главное меню' },
]).catch(err => console.error('Failed to set bot commands:', err));

bot.launch()
    .then(() => {
        console.log('✅ Бот успешно подключен к Telegram');
        console.log('Нажмите Ctrl+C для остановки');
    })
    .catch((err) => {
        console.error('❌ Ошибка запуска:', err);
        if (err.message.includes('401')) {
            console.log('\n💡 Подсказка: Проверьте ваш TELEGRAM_BOT_TOKEN в файле .env');
        }
    });

// Плавная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
