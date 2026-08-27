import { AdvertisementCategory } from './advertisement-category';
import { Location } from './location';

export interface Advertisement {
    id: string;
    title: string;
    description: string;
    category: AdvertisementCategory;
    price?: number;
    location?: Location;
    createdByUserId: string;
    createdAtUtc: string;
    updatedAtUtc?: string;
    isOwnedByCurrentUser: boolean;
}