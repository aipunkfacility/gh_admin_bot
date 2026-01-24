import { z } from 'zod';

// --- Shared Schemas ---
export const BaseItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    image: z.string().optional(),
    details: z.string().optional(),
    isActive: z.boolean().default(true),
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
    shortDescription: z.string().optional(),
    priceFrom: z.string().optional(),
    duration: z.string().optional(),
    isPopular: z.boolean().optional(),
    schedule: z.array(z.string()).optional(),
    included: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
});

// --- Admin UI Schema Registry ---
export const schemas: Record<string, any> = {
    'transport-items': {
        name: 'Транспорт',
        schema: TransportSchema,
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'categoryId', label: 'Категория', type: 'select', options: ['standard', 'comfort', 'maxi', 'moto', 'car'], required: true },
            { name: 'image', label: 'Фото', type: 'image' },
            { name: 'pricePerDay', label: 'Цена/день', type: 'text' },
            { name: 'useCases', label: 'Описание (Use Cases)', type: 'textarea' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true },
            { name: 'isPopular', label: 'Популярное', type: 'checkbox' },
            { name: 'benefits', label: 'Преимущества', type: 'array' },
            { name: 'specs', label: 'Характеристики', type: 'array' },
            { name: 'features', label: 'Особенности', type: 'array' },
        ]
    },
    'excursions': {
        name: 'Экскурсии',
        schema: ExcursionSchema,
        fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            { name: 'image', label: 'Фото', type: 'image' },
            { name: 'priceFrom', label: 'Цена от', type: 'text' },
            { name: 'duration', label: 'Длительность', type: 'text' },
            { name: 'shortDescription', label: 'Краткое описание', type: 'textarea' },
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true },
            { name: 'isPopular', label: 'Популярное', type: 'checkbox' },
            { name: 'schedule', label: 'Расписание', type: 'array' },
            { name: 'included', label: 'Включено', type: 'array' },
            { name: 'highlights', label: 'Что увидим', type: 'array' },
            { name: 'details', label: 'Детальное описание', type: 'textarea' },
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
            { name: 'isActive', label: 'Активно', type: 'checkbox', default: true },
            { name: 'roomFeatures', label: 'В номере', type: 'array' },
            { name: 'atmosphere', label: 'Атмосфера', type: 'textarea' },
            { name: 'locationDescription', label: 'О расположении', type: 'textarea' },
        ]
    }
};

// Types inferred from Zod
export type TransportItem = z.infer<typeof TransportSchema>;
export type Accommodation = z.infer<typeof AccommodationSchema>;
export type Excursion = z.infer<typeof ExcursionSchema>;
