export interface BaseItem {
  id: string;
  isActive?: boolean;
  isPopular?: boolean;
}

export interface Excursion extends BaseItem {
  title: string;
  slug: string;
  shortDescription?: string;
  priceFrom?: string;
  duration?: string;
  image?: string;
  details?: string;
}

export interface TransportItem extends BaseItem {
  title: string;
  slug: string;
  categoryId: string;
  useCases?: string;
  benefits?: string[];
  specs?: string[];
  details?: string;
  image?: string;
}

export interface Accommodation extends BaseItem {
  title: string;
  slug: string;
  type: 'resort' | 'guesthouse' | 'villa';
  slogan?: string;
  territoryDescription?: string;
  roomFeatures?: string[];
  details?: string;
  atmosphere?: string;
  locationDescription?: string;
  address?: string;
  image?: string;
}

export interface Service extends BaseItem {
  title: string;
  slug: string;
  shortDescription?: string;
  details?: string;
  type: 'visa' | 'transfer' | 'exchange' | string;
  image?: string;
}

export interface SiteContacts {
  telegramManager?: string;
  telegramChannel?: string;
}

export interface SiteMeta {
  mainTitle?: string;
  mainSubtitle?: string;
  whatsappNumber?: string;
  contacts?: SiteContacts;
}

export type CollectionName = 'excursions' | 'transport-items' | 'accommodations' | 'services' | 'site-meta';

export type CollectionItem = Excursion | TransportItem | Accommodation | Service;

export interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image';
  required?: boolean;
  help?: string;
  rows?: number;
  options?: string[];
  default?: unknown;
}

export interface Schema {
  fields: SchemaField[];
}

export type Schemas = Record<CollectionName, Schema>;
