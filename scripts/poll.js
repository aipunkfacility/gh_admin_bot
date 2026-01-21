import 'dotenv/config';
import { bot } from '../src/lib/bot/index.js';

console.log('---');
console.log('🚀 Бот запущен в режиме Long Polling (локально)...');
console.log('---');

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
