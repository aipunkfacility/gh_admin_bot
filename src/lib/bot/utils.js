/**
 * Форматирует число с разделителями тысяч
 * @param {number} num - Число для форматирования
 * @returns {string} Отформатированное число (например: "25 000")
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Получает полный URL изображения
 * @param {string} imagePath - Относительный путь изображения
 * @returns {string} Полный URL
 */
export function getFullImageUrl(imagePath) {
  const domain = process.env.WEBHOOK_DOMAIN || '';
  return domain + imagePath;
}

/**
 * Валидация числового ввода
 * @param {string} input - Строка ввода пользователя
 * @returns {number|null} Число или null если невалидно
 */
export function validateNumberInput(input) {
  // Удаляем пробелы, точки, запятые
  const cleaned = input.replace(/[\s.,]/g, '');

  // Проверяем, что это только цифры
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }

  return parseInt(cleaned, 10);
}

/**
 * Читает JSON файл
 * @param {string} filepath - Путь к файлу относительно public/data
 * @returns {Promise<any>} Данные из JSON
 */
export async function readJsonFile(filepath) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const fullPath = path.join(process.cwd(), 'public', 'data', filepath);
  const data = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Записывает JSON файл
 * @param {string} filepath - Путь к файлу относительно public/data
 * @param {any} data - Данные для записи
 */
export async function writeJsonFile(filepath, data) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const fullPath = path.join(process.cwd(), 'public', 'data', filepath);
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

// ========== ПАГИНАЦИЯ ==========

/**
 * Пагинирует массив элементов
 * @param {Array} items - Массив элементов
 * @param {number} page - Текущая страница (1-indexed)
 * @param {number} perPage - Элементов на странице
 * @returns {Object} Результат пагинации
 */
export function paginate(items, page = 1, perPage = 5) {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const currentPage = Math.min(Math.max(1, page), totalPages || 1);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  return {
    items: items.slice(start, end),
    currentPage,
    totalPages,
    total,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

/**
 * Создает inline-клавиатуру с пагинацией
 * @param {string} prefix - Префикс для callback_data (напр. 'transport')
 * @param {number} currentPage - Текущая страница
 * @param {number} totalPages - Всего страниц
 * @param {boolean} hasNext - Есть следующая страница
 * @param {boolean} hasPrev - Есть предыдущая страница
 * @returns {Array} Массив кнопок для inline_keyboard
 */
export function getPaginationButtons(prefix, currentPage, totalPages, hasNext, hasPrev) {
  const buttons = [];

  if (hasPrev) {
    buttons.push({ text: '◀️', callback_data: `${prefix}_page_${currentPage - 1}` });
  }

  buttons.push({ text: `${currentPage}/${totalPages}`, callback_data: 'noop' });

  if (hasNext) {
    buttons.push({ text: '▶️', callback_data: `${prefix}_page_${currentPage + 1}` });
  }

  return buttons;
}

// ========== ФОРМАТИРОВАНИЕ КАРТОЧЕК ==========

/**
 * Форматирует карточку экскурсии для Telegram
 * @param {Object} item - Объект экскурсии
 * @returns {string} Отформатированный текст
 */
export function formatExcursionCard(item) {
  let text = `🌴 *${escapeMarkdown(item.title)}*\n\n`;

  if (item.shortDescription) {
    text += `📝 ${escapeMarkdown(item.shortDescription)}\n\n`;
  }

  if (item.highlights?.length) {
    text += `📸 *Что увидим:*\n`;
    text += item.highlights.map(h => `• ${escapeMarkdown(h)}`).join('\n');
    text += '\n\n';
  }

  if (item.schedule) {
    text += `⏰ *Расписание:* ${escapeMarkdown(item.schedule)}\n\n`;
  }

  if (item.duration) {
    text += `🕐 *Длительность:* ${escapeMarkdown(item.duration)}\n\n`;
  }

  if (item.included?.length) {
    text += `✅ *Включено:*\n`;
    text += item.included.map(i => `• ${escapeMarkdown(i)}`).join('\n');
    text += '\n\n';
  }

  if (item.priceFrom) {
    text += `💰 *Цена:* ${escapeMarkdown(item.priceFrom)}`;
  }

  return text;
}

/**
 * Форматирует карточку транспорта для Telegram
 * @param {Object} item - Объект транспорта
 * @returns {string} Отформатированный текст
 */
export function formatTransportCard(item) {
  let text = `🏍 *${escapeMarkdown(item.title)}*\n\n`;

  if (item.useCases) {
    text += `🎯 ${escapeMarkdown(item.useCases)}\n\n`;
  }

  if (item.features?.length) {
    text += `⭐️ *Особенности:*\n`;
    text += item.features.map(f => `• ${escapeMarkdown(f)}`).join('\n');
    text += '\n\n';
  }

  if (item.benefits?.length) {
    text += `👍 *Преимущества:*\n`;
    text += item.benefits.map(b => `• ${escapeMarkdown(b)}`).join('\n');
    text += '\n\n';
  }

  if (item.specs?.length) {
    text += `📋 *Характеристики:*\n`;
    text += item.specs.map(s => `• ${escapeMarkdown(s)}`).join('\n');
    text += '\n\n';
  }

  if (item.pricePerDay) {
    text += `💰 *Цена:* ${escapeMarkdown(item.pricePerDay)}/день`;
  }

  return text;
}

/**
 * Форматирует карточку жилья для Telegram
 * @param {Object} item - Объект жилья
 * @returns {string} Отформатированный текст
 */
export function formatAccommodationCard(item) {
  let text = `🏨 *${escapeMarkdown(item.title)}*\n\n`;

  if (item.slogan) {
    text += `📝 ${escapeMarkdown(item.slogan)}\n\n`;
  }

  if (item.territoryDescription) {
    text += `🌿 *Территория:*\n${escapeMarkdown(item.territoryDescription)}\n\n`;
  }

  if (item.roomFeatures?.length) {
    text += `🛏 *В номере:*\n`;
    text += item.roomFeatures.map(f => `• ${escapeMarkdown(f)}`).join('\n');
    text += '\n\n';
  }

  if (item.atmosphere) {
    text += `✨ *Атмосфера:*\n${escapeMarkdown(item.atmosphere)}\n\n`;
  }

  if (item.address) {
    text += `📍 *Адрес:* ${escapeMarkdown(item.address)}`;
  }

  return text;
}

/**
 * Экранирует спецсимволы Markdown для Telegram
 * @param {string} text - Исходный текст
 * @returns {string} Экранированный текст
 */
export function escapeMarkdown(text) {
  if (!text) return '';
  return text.toString().replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');
}

/**
 * тправляет фото с fallback на текст если фото не загрузится
 * @param {import('telegraf').Context} ctx - Telegraf context
 * @param {string} imageUrl - URL изображения
 * @param {string} text - Текст caption
 * @param {Array} buttons - ассив кнопок для inline_keyboard
 * @returns {Promise<void>}
 */
export async function replyWithImageFallback(ctx, imageUrl, text, buttons) {
  const { logger } = await import('../logger.js');

  try {
    await ctx.replyWithPhoto(imageUrl, {
      caption: text,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons }
    });
  } catch (error) {
    logger.warn('Failed to send photo', {
      error: error.message,
      imageUrl,
      userId: ctx.from?.id
    });
    await ctx.reply(`${text}\n\n⚠️ Фото временно недоступно`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons }
    });
  }
}

/**
 * алидирует itemId для безопасности
 * @param {string} itemId - ID для проверки
 * @returns {boolean} true если валидный
 */
export function validateItemId(itemId) {
  if (!itemId || typeof itemId !== 'string') return false;
  if (itemId.length > 50) return false;
  return /^[a-z0-9-]+$/i.test(itemId);
}
