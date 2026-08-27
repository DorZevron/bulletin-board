import { AdvertisementCategory } from './advertisement-category';
import { Location } from './location';

export interface CreateAdvertisementRequest {
    title: string;
    description: string;
    category: AdvertisementCategory;
    price?: number;
    location?: Location;
}