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

/**
 * Преобразует текстовое поле details в структурированный HTML.
 * Работает на этапе сборки в Astro.
 */
export function formatServiceDetails(text) {
    if (!text) return '';

    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => {
            return line &&
                !line.includes('@GreenHill_Support') &&
                !line.includes('wa.me') &&
                !line.startsWith('👉');
        });

    let html = '';
    let inList = false;

    lines.forEach(line => {
        const isHeader = /^[\u2705\uD83D\uDD53\uD83D\uDCA0\uD83D\uDCA3\uD83D\uDE90\uD83D\uDE98\uD83C\uDFD4\uD83C\uDFD6\uD83C\uDF03\uD83C\uDFA2\uD83C\uDFA1]/.test(line) || line.endsWith(':');
        const isListItem = line.startsWith('•');

        if (isListItem) {
            if (!inList) {
                html += '<ul class="service-details-list">';
                inList = true;
            }
            html += `<li>${escapeHTML(line.substring(1).trim())}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            if (isHeader) {
                html += `<h4 class="service-details-header">${escapeHTML(line)}</h4>`;
            } else {
                html += `<p class="service-details-text">${escapeHTML(line)}</p>`;
            }
        }
    });

    if (inList) html += '</ul>';
    return html;
}
