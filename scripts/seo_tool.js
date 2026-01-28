import { supabaseAdmin } from '../src/lib/supabase.js';
import minimist from 'minimist';
import fs from 'fs/promises';

const args = minimist(process.argv.slice(2));

/**
 * Преобразует имя файла/коллекции в имя таблицы Supabase
 */
function getTableName(name) {
    const mapping = {
        'excursion-items': 'excursions',
        'excursions': 'excursions',
        'accommodation-items': 'accommodations',
        'accommodations': 'accommodations',
        'transport-items': 'transport_items'
    };
    return mapping[name] || name.replace(/-/g, '_');
}

/**
 * Скрипт для работы с SEO описаниями
 * Использование: 
 * node scripts/seo_tool.js --table excursions --list
 * node scripts/seo_tool.js --table excursions --export docs/review.json
 * node scripts/seo_tool.js --table excursions --import docs/review.json
 */

async function run() {
    const { table, id, text, apply, list, export: exportPath, import: importPath } = args;

    if (list) {
        console.log(`🔍 Проверка мета-описаний в таблице ${table || 'excursions'}...`);
        const tableName = getTableName(table || 'excursions');
        const { data, error } = await supabaseAdmin.from(tableName).select('id, slug, title, metaDescription');

        if (error) {
            console.error('❌ Ошибка:', error.message);
            return;
        }

        data.forEach(item => {
            const status = item.metaDescription ? '✅' : '❌';
            console.log(`${status} [${item.slug}] ${item.title}`);
        });
        return;
    }

    if (exportPath && table) {
        const tableName = getTableName(table);
        console.log(`📤 Экспорт данных из ${tableName} в ${exportPath}...`);
        const { data, error } = await supabaseAdmin.from(tableName).select('slug, title, metaDescription');

        if (error) {
            console.error('❌ Ошибка чтения:', error.message);
            return;
        }

        await fs.writeFile(exportPath, JSON.stringify(data, null, 2));
        console.log(`✅ Файл создан. Можете приступать к редактированию поля metaDescription.`);
        return;
    }

    if (importPath && table) {
        const tableName = getTableName(table);
        console.log(`📥 Импорт данных из ${importPath} в ${tableName}...`);
        const content = await fs.readFile(importPath, 'utf8');
        const items = JSON.parse(content);

        for (const item of items) {
            if (item.metaDescription) {
                console.log(`  Updating [${item.slug}]...`);
                const { error } = await supabaseAdmin
                    .from(tableName)
                    .update({ metaDescription: item.metaDescription })
                    .eq('slug', item.slug);

                if (error) console.error(`  ❌ Error updating ${item.slug}:`, error.message);
            }
        }
        console.log('✅ Импорт завершен.');
        return;
    }

    if (apply && table && id && text) {
        console.log(`💾 Применяю SEO для ${id} в таблице ${table}...`);
        const tableName = getTableName(table);

        const { error } = await supabaseAdmin
            .from(tableName)
            .update({ metaDescription: text })
            .eq('slug', id);

        if (error) {
            console.error('❌ Ошибка при обновлении:', error.message);
        } else {
            console.log('✅ Успешно обновлено!');
        }
        return;
    }

    console.log(`
    Использование seo_tool.js:
    --list --table <name>          Список всех элементов и статус их SEO
    --export <path> --table <name> Сохранить текущие описания в файл для ревью
    --import <path> --table <name> Записать описания из файла в базу данных
    --apply --table <name> --id <slug> --text "<текст>"   Записать SEO точечно
    `);
}

run();
