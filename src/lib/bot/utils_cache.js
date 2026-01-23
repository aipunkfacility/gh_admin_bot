// эш для JSON файлов
const jsonCache = new Map();

/**
 * итает JSON файл с кэшированием
 * @param {string} filepath - уть к файлу относительно public/data
 * @param {number} ttl - Time to live в миллисекундах (по умолчанию 60 секунд)
 * @returns {Promise<any>} анные из JSON
 */
export async function readJsonFile(filepath, ttl = 60000) {
  const cached = jsonCache.get(filepath);
  if (cached && Date.now() - cached.time < ttl) {
    return cached.data;
  }

  const fs = await import('fs/promises');
  const path = await import('path');

  const fullPath = path.join(process.cwd(), 'public', 'data', filepath);
  const data = await fs.readFile(fullPath, 'utf-8');
  const parsed = JSON.parse(data);

  jsonCache.set(filepath, { data: parsed, time: Date.now() });
  return parsed;
}

// чистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of jsonCache.entries()) {
    if (now - value.time > 300000) { // 5 минут
      jsonCache.delete(key);
    }
  }
}, 300000);
