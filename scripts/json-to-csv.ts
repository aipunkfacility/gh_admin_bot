import fs from 'fs/promises';
import path from 'path';

const JSON_FILE = path.join(process.cwd(), 'public', 'data', 'rates.json');
const CSV_FILE = path.join(process.cwd(), 'rates.csv');

(async () => {
  console.log('🔄 Конвертация JSON -> CSV...');

  try {
    const content = await fs.readFile(JSON_FILE, 'utf-8');
    const jsonData = JSON.parse(content);

    // Защита: Если JSON это объект (например, { USD: {...} ), превращаем в массив значений
    let dataArray: any[] = [];
    if (Array.isArray(jsonData)) {
      dataArray = jsonData;
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      dataArray = Object.values(jsonData);
    }

    if (dataArray.length === 0) {
      console.log('❌ В файле нет данных');
      return;
    }

    // Заголовки CSV (берем ключи первого элемента)
    const headers = Object.keys(dataArray[0]);

    // Формируем строки CSV (экранируем кавычками)
    const csvRows = dataArray.map(row => 
      headers.map(fieldName => {
        const val = row[fieldName];
        // Если значение есть и содержит запятую или кавычку — оборачиваем в кавычки
        const cell = val == null ? '' : String(val);
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    );

    const csvContent = headers.join(',') + '\n' + csvRows.join('\n');

    await fs.writeFile(CSV_FILE, csvContent);
    console.log(`✅ Файл ${CSV_FILE} успешно создан!`);

  } catch (err) {
    console.error('❌ Ошибка:', err);
  }
})();