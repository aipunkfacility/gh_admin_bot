import { z } from 'zod';

// --- Shared Schemas ---
export const BaseItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    image: z.string().optional(),
    details: z.string().optional(),
    isActive: z.boolean().default(true),
    tgMessageId: z.string().nullable().optional(),
    tgImage: z.string().optional(),
    tgText: z.string().optional(),
});

// --- Auth Schemas ---
export const LoginSchema = z.object({
    password: z.string().min(1, "Password is required"),
});

// --- Data Schemas ---

export const TransportSchema = BaseItemSchema.extend({
    categoryId: z.string(),
    useCases: z.string().optional(), // "short description"
    pricePerDay: z.string().optional(),
    pricePerMonth: z.string().optional(),
    deposit: z.string().optional(),
    benefits: z.array(z.string()).optional(),
    specs: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    isPopular: z.boolean().optional(),
});

export const AccommodationSchema = BaseItemSchema.extend({
    slogan: z.string().optional(),
    address: z.string().optional(),
    priceStart: z.string().optional(),
    territoryDescription: z.string().optional(),
    roomFeatures: z.array(z.string()).optional(),
    atmosphere: z.string().optional(),
    locationDescription: z.string().optional(),
});

export const ExcursionSchema = BaseItemSchema.extend({
    categoryId: z.string(),
    shortDescription: z.string().optional(),
    priceFrom: z.string().optional(),
    duration: z.string().optional(),
    isPopular: z.boolean().optional(),
    schedule: z.array(z.string()).optional(),
    included: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
});

export const PostSchema = z.object({
    id: z.string(),
    title: z.string().optional(), // Admin-only title
    text: z.string().min(1, "Текст поста обязателен"),
    image: z.string().optional(),
    createdAt: z.string().optional(),
    sentAt: z.string().optional(),
    status: z.enum(['draft', 'sent']).default('draft'),
    tgMessageId: z.string().nullable().optional(),
});

// ...


export const ServiceSchema = BaseItemSchema.extend({
    shortDescription: z.string().optional(),
    priceFrom: z.string().optional(),
    schedule: z.string().optional(),
    details: z.string().optional(),
    features: z.array(z.string()).optional(),
    included: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    type: z.string().default('service'),
    isPopular: z.boolean().optional(),
});

// --- Telegram Fields Helper ---
const tgFields = [
    { name: 'tgImage', label: 'Фото для Telegram', type: 'image', help: 'Если пусто — берется основное фото' },
    { name: 'tgMessageId', label: 'ID сообщения в канале', type: 'text', help: 'Заполнится автоматически при отправке.', readOnly: true },
];

interface SchemaMetadata {
    name: string;
    schema: import('zod').ZodTypeAny; // Better than any
    fields: Array<{
        name: string;
        label: string;
        type: string;
        required?: boolean;
        options?: unknown;
        default?: unknown;
        readOnly?: boolean;
        help?: string;
        colSpan?: number;
        placeholder?: string;
    }>;
    showInMenu?: boolean;
}

// --- Admin UI Schema Registry ---
export const schemas: Record<string, SchemaMetadata> = {
    'posts': {
        name: 'Посты (Telegram)',
        schema: PostSchema,
        fields: [
            { name: 'title', label: 'Заголовок (для админки)', type: 'text', placeholder: 'Например: Акция на Визаран' },
            { name: 'text', label: 'Текст поста (Markdown)', type: 'textarea', required: true },
            { name: 'image', label: 'Фото к посту', type: 'image' },
            {
                name: 'status', label: 'Статус', type: 'select', options: [
                    { value: 'draft', label: 'Черновик' },
                    { value: 'sent', label: 'Отправлено' }
                ], default: 'draft'
            },
            { name: 'tgMessageId', label: 'ID сообщения', type: 'text', readOnly: true },
        ],
        showInMenu: true
    },
    'transport-items': {
        name: 'Транспорт',
        schema: TransportSchema,
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'categoryId', label: 'Категория', type: 'select', options: ['standard', 'comfort', 'maxi', 'moto', 'car'], required: true, colSpan: 1 },
            { name: 'pricePerDay', label: 'Цена/день', type: 'text', colSpan: 1 },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true, colSpan: 1 },
            { name: 'isPopular', label: 'Популярное', type: 'checkbox', colSpan: 1 },
            { name: 'image', label: 'Фото', type: 'image' },
            { name: 'useCases', label: 'Описание (Use Cases)', type: 'textarea' },
            { name: 'benefits', label: 'Преимущества', type: 'array' },
            { name: 'specs', label: 'Характеристики', type: 'array' },
            { name: 'features', label: 'Особенности', type: 'array' },
            ...tgFields
        ]
    },
    'excursions': {
        name: 'Экскурсии',
        schema: ExcursionSchema,
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            {
                name: 'categoryId', label: 'Категория', type: 'select', options: [
                    { value: 'nature', label: 'Приключения и Природа' },
                    { value: 'history', label: 'История и Города' },
                    { value: 'islands', label: 'Острова и Парки' }
                ], required: true, colSpan: 2
            },
            { name: 'image', label: 'Фото', type: 'image' },
            { name: 'priceFrom', label: 'Цена от', type: 'text', colSpan: 1 },
            { name: 'duration', label: 'Длительность', type: 'text', colSpan: 1 },
            { name: 'shortDescription', label: 'Краткое описание', type: 'textarea' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true, colSpan: 1 },
            { name: 'isPopular', label: 'Популярное', type: 'checkbox', colSpan: 1 },
            { name: 'schedule', label: 'Расписание', type: 'array' },
            { name: 'included', label: 'Включено', type: 'array' },
            { name: 'highlights', label: 'Что увидим', type: 'array' },
            { name: 'details', label: 'Детальное описание', type: 'textarea' },
            ...tgFields
        ]
    },
    'accommodations': {
        name: 'Жилье',
        schema: AccommodationSchema,
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'image', label: 'Фото', type: 'image' },
            { name: 'slogan', label: 'Слоган', type: 'text' },
            { name: 'address', label: 'Адрес', type: 'text' },
            // { name: 'priceStart', label: 'Цена от', type: 'text' },
            { name: 'territoryDescription', label: 'О территории', type: 'textarea' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true, colSpan: 1 },
            { name: 'roomFeatures', label: 'В номере', type: 'array' },
            { name: 'atmosphere', label: 'Атмосфера', type: 'textarea' },
            { name: 'locationDescription', label: 'О расположении', type: 'textarea' },
            ...tgFields
        ]
    },
    'services': {
        name: 'Услуги',
        schema: ServiceSchema,
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'image', label: 'Фото', type: 'image' },
            { name: 'shortDescription', label: 'Краткое описание', type: 'textarea' },
            { name: 'priceFrom', label: 'Цена от', type: 'text', colSpan: 1 },
            { name: 'details', label: 'Детали (Полное описание)', type: 'textarea' },
            { name: 'features', label: 'Особенности', type: 'array' },
            { name: 'requirements', label: 'Требования', type: 'array' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true, colSpan: 1 },
            { name: 'isPopular', label: 'Популярное', type: 'checkbox', colSpan: 1 },
            ...tgFields
        ]
    },
    'site-meta': {
        name: 'Настройки сайта',
        schema: BaseItemSchema.extend({
            mainTitle: z.string().optional(),
            mainSubtitle: z.string().optional(),
            whatsappNumber: z.string().optional(),
            'contacts.telegramManager': z.string().optional(),
            'contacts.telegramChannel': z.string().optional(),
            'contacts.telegramBot': z.string().optional(),
            'contacts.offices': z.any().optional(),
            copyrightYear: z.string().optional(),
        }),
        fields: [
            { name: 'mainTitle', label: 'Заголовок сайта', type: 'text', colSpan: 2 },
            { name: 'mainSubtitle', label: 'Подзаголовок', type: 'textarea', colSpan: 2 },
            { name: 'copyrightYear', label: 'Год (Copyright)', type: 'text', colSpan: 1 },
            { name: 'whatsappNumber', label: 'WhatsApp (Номер)', type: 'text', colSpan: 1 },
            { name: 'contacts.telegramManager', label: 'Telegram Менеджер', type: 'text', colSpan: 1 },
            { name: 'contacts.telegramChannel', label: 'Telegram Канал', type: 'text', colSpan: 1 },
            { name: 'contacts.telegramBot', label: 'Telegram Бот', type: 'text', colSpan: 1 },
            { name: 'contacts.offices', label: 'Офисы', type: 'offices', colSpan: 2 }
        ]
    },
    'sections': {
        name: 'Разделы',
        schema: BaseItemSchema.extend({
            slug: z.string(),
            heroTitle: z.string().optional(),
            heroSubtitle: z.string().optional(),
            heroImage: z.string().optional(),
        }),
        fields: [
            { name: 'title', label: 'Название в меню', type: 'text', required: true },
            { name: 'slug', label: 'Slug (path)', type: 'text', required: true },
            { name: 'heroTitle', label: 'Заголовок Hero', type: 'text' },
            { name: 'heroSubtitle', label: 'Подзаголовок Hero', type: 'textarea' },
            { name: 'heroImage', label: 'Фон Hero', type: 'image' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true },
        ]
    },
    'transport-categories': {
        name: 'Категории транспорта',
        schema: z.object({
            id: z.string(),
            title: z.string(),
            slug: z.string(),
            badgeTitle: z.string().optional(),
            isActive: z.boolean().default(true),
        }),
        fields: [
            { name: 'title', label: 'Название (Заголовок)', type: 'text', required: true },
            { name: 'slug', label: 'Slug (ID)', type: 'text', required: true },
            { name: 'badgeTitle', label: 'Короткое название (для кнопок)', type: 'text' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true },
        ],
        showInMenu: true
    },
    'excursion-categories': {
        name: 'Категории экскурсий',
        schema: z.object({
            id: z.string(),
            title: z.string(),
            slug: z.string(),
            icon: z.string().optional(),
            isActive: z.boolean().default(true),
        }),
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'slug', label: 'Slug (ID)', type: 'text', required: true },
            { name: 'icon', label: 'Иконка (RemixIcon)', type: 'text', placeholder: 'ri-landscape-line' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true },
        ],
        showInMenu: false
    }
};

// Types inferred from Zod
export type TransportItem = z.infer<typeof TransportSchema>;
export type Accommodation = z.infer<typeof AccommodationSchema>;
export type Excursion = z.infer<typeof ExcursionSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Service = z.infer<typeof ServiceSchema>;

export type Category = {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    badgeTitle?: string;
    isActive: boolean; // or boolean | undefined depending on schema default
}; // Manually defined or inferred from one of the category schemas

