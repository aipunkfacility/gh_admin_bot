import { bot } from '../src/lib/bot/index.js';

console.log('---');
console.log('🚀 Бот запущен в режиме Long Polling (VPS/Local)...');
console.log('---');

// Запуск
bot.launch().then(() => {
    console.log('✅ Bot started successfully');

    // Set commands
    bot.telegram.setMyCommands([
        { command: 'start', description: 'Запустить бота / Start' },
        { command: 'menu', description: 'Главное меню / Main Menu' }
    ]).catch(err => console.error('Failed to set commands:', err));

}).catch(err => {
    console.error('❌ Ошибка запуска:', err);
});

// Graceful stop
process.once('SIGINT', () => {
    console.log('🛑 Получен сигнал SIGINT. Остановка бота...');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.log('🛑 Получен сигнал SIGTERM. Остановка бота...');
    bot.stop('SIGTERM');
});
