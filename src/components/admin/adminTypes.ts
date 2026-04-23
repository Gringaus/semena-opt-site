export const AUTH_URL = 'https://functions.poehali.dev/1fb7ab54-3a59-45b3-ba0e-11a67ac583d5';
export const NEWS_URL = 'https://functions.poehali.dev/aef555b4-f74a-4447-9294-470c7ea276e9';
export const ARCHIVE_URL = 'https://functions.poehali.dev/aef555b4-f74a-4447-9294-470c7ea276e9?kind=archive';
export const CATALOG_URL = 'https://functions.poehali.dev/9eabe422-fd0a-4167-afb7-acc6cf903f76';

export type Tab = 'news' | 'archive' | 'catalog' | 'account';

export interface NewsImageUpload { base64: string; filename: string; contentType: string }
export interface NewsItem { id?: number; slug?: string; date: string; tag: string; title: string; text: string; content: string; image?: string; imageBase64?: string; imageFilename?: string; imageContentType?: string; published?: boolean; images?: string[]; imagesUploads?: NewsImageUpload[] }
export interface ArchiveItem { id?: number; slug?: string; date: string; title: string; content: string; image?: string; imageBase64?: string; imageFilename?: string; imageContentType?: string; sort?: number; images?: string[]; imagesUploads?: NewsImageUpload[] }
export interface CatalogItem { id?: number; name: string; count: number; img: string; items: string; sort?: number }