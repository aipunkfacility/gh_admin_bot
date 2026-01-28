import fs from 'fs';
import path from 'path';

const DOCS_DIR = './docs';
const CHANGELOG_PATH = path.join(DOCS_DIR, 'CHANGELOG.md');
const HISTORY_DIR = path.join(DOCS_DIR, 'history');

function verify() {
    console.log('🔍 Проверка актуальности документации...');

    // 1. Проверка существования файлов
    const files = [CHANGELOG_PATH, path.join(DOCS_DIR, 'BACKLOG.md')];
    files.forEach(f => {
        if (!fs.existsSync(f)) {
            console.error(`❌ Ошибка: ${f} не найден!`);
            process.exit(1);
        }
    });

    // 2. Проверка даты последнего изменения
    const today = new Date().toISOString().split('T')[0];
    const changelogContent = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

    if (!changelogContent.includes(today)) {
        console.warn(`⚠️ Внимание: В CHANGELOG.md нет записей за сегодня (${today})`);
    } else {
        console.log('✅ CHANGELOG.md содержит запись за сегодня.');
    }

    // 3. Проверка наличия свежего лога в истории
    const historyFiles = fs.readdirSync(HISTORY_DIR);
    const updatedToday = historyFiles.some(file => file.startsWith(today));

    if (!updatedToday) {
        console.warn(`⚠️ Внимание: В docs/history/ не найдено новых файлов за сегодня.`);
    } else {
        console.log('✅ Файл истории за сегодня найден.');
    }

    console.log('\n📝 Документация готова к проверке пользователем.');
    console.log('🤖 ИИ-агент: ЗАПРЕЩЕНО закрывать задачу без явного одобрения "Да" от человека!');
}

verify();
