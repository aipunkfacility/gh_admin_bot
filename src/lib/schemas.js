
export const schemas = {
    excursions: {
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'priceFrom', label: 'Цена (от)', type: 'text' },
            { name: 'duration', label: 'Длительность', type: 'text' },
            { name: 'schedule', label: 'Расписание', type: 'text', help: 'Например: Выезд 04:30 / 13:30' },
            { name: 'highlights', label: 'Что увидим (Highlights)', type: 'array', help: 'Главные точки маршрута' },
            { name: 'included', label: 'Что включено', type: 'array', help: 'Список включенных услуг' },
            { name: 'shortDescription', label: 'Краткое описание', type: 'textarea' },
            { name: 'details', label: 'Полное описание', type: 'textarea', rows: 10 },
            { name: 'image', label: 'Изображение', type: 'image' }
        ]
    },
    'transport-items': {
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'pricePerDay', label: 'Цена за 1 день', type: 'text' },
            {
                name: 'categoryId', label: 'Категория', type: 'select', options: [
                    { value: 'standard', label: 'Стандарт' },
                    { value: 'comfort', label: 'Комфорт' },
                    { value: 'maxi', label: 'Макси-скутер' },
                    { value: 'moto', label: 'Мотоцикл' },
                    { value: 'car', label: 'Авто' }
                ]
            },
            { name: 'useCases', label: 'Для кого подходит', type: 'textarea', help: 'Краткое описание применения' },
            { name: 'benefits', label: 'Преимущества', type: 'array', help: 'Список преимуществ (каждое с новой строки)' },
            { name: 'specs', label: 'Характеристики', type: 'array', help: 'Список характеристик (каждая с новой строки)' },
            { name: 'features', label: 'Особенности', type: 'array', help: 'Доп. особенности' },
            { name: 'details', label: 'Полное описание', type: 'textarea', rows: 8 },
            { name: 'image', label: 'Фото', type: 'image' }
        ]
    },
    accommodations: {
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            {
                name: 'type', label: 'Тип', type: 'select', options: [
                    { value: 'hotel', label: 'Отель' },
                    { value: 'villa', label: 'Вилла' },
                    { value: 'apartment', label: 'Апартаменты' },
                    { value: 'guesthouse', label: 'Гостевой дом' }
                ]
            },
            { name: 'slogan', label: 'Слоган', type: 'text' },
            { name: 'territoryDescription', label: 'Описание территории', type: 'textarea' },
            { name: 'roomFeatures', label: 'Особенности номеров', type: 'array', help: 'Список особенностей (каждая с новой строки)' },
            { name: 'details', label: 'Подробное описание', type: 'textarea', rows: 8 },
            { name: 'atmosphere', label: 'Атмосфера', type: 'textarea', help: 'Описание атмосферы места' },
            { name: 'locationDescription', label: 'Расположение', type: 'textarea', help: 'Описание местоположения' },
            { name: 'address', label: 'Адрес', type: 'text' },
            { name: 'image', label: 'Главное фото', type: 'image' }
        ]
    },
    services: {
        fields: [
            { name: 'title', label: 'Название услуги', type: 'text', required: true },
            { name: 'priceFrom', label: 'Цена', type: 'text', help: 'Например: от $50' },
            { name: 'schedule', label: 'Расписание / Время', type: 'text' },
            {
                name: 'type', label: 'Тип услуги', type: 'select', options: [
                    { value: 'transfer', label: 'Трансфер' },
                    { value: 'tour', label: 'Тур' },
                    { value: 'service', label: 'Услуга' },
                    { value: 'other', label: 'Другое' }
                ]
            },
            { name: 'features', label: 'Особенности', type: 'array', help: 'Список особенностей' },
            { name: 'included', label: 'Что включено', type: 'array', help: 'Список включенных опций' },
            { name: 'requirements', label: 'Для бронирования', type: 'array', help: 'Требования (паспорт, предоплата...)' },
            { name: 'shortDescription', label: 'Краткое описание', type: 'textarea' },
            { name: 'details', label: 'Полное описание', type: 'textarea', rows: 8 },
            { name: 'image', label: 'Иконка/Фото', type: 'image' }
        ]
    },
    'site-meta': {
        fields: [
            { name: 'mainTitle', label: 'Заголовок сайта', type: 'text' },
            { name: 'mainSubtitle', label: 'Подзаголовок', type: 'text' },
            { name: 'whatsappNumber', label: 'WhatsApp (только цифры)', type: 'text' },
            { name: 'contacts.telegramManager', label: 'Telegram Менеджера', type: 'text' },
            { name: 'contacts.telegramChannel', label: 'Telegram Канал', type: 'text' },
            { name: 'contacts.telegramBot', label: 'Telegram Бот', type: 'text' },
            { name: 'contacts.offices', label: 'Офисы', type: 'offices', help: 'Список офисов с адресами и ссылками на карты' },
        ]
    }
};
