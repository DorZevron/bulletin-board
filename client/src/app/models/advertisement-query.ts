import { AdvertisementCategory } from './advertisement-category';

export interface AdvertisementQuery {
    search?: string;
    category?: AdvertisementCategory;
    minPrice?: number;
    maxPrice?: number;
    mineOnly?: boolean;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    page: number;
    pageSize: number;
}