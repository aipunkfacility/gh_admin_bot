// Функция для защиты от XSS-атак (Server-side version for Astro)
export function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Функция для фильтрации только активных элементов
export function filterActive(items) {
    return items.filter(item => item.isActive !== false);
}


