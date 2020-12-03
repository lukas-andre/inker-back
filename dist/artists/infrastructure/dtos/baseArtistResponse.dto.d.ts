import { Gender } from '../entities/genders.entity';
import { Tag } from '../entities/tag.entity';
export declare class BaseArtistResponse {
    id?: number;
    userId?: number;
    firstName?: string;
    lastName?: string;
    contactEmail?: string;
    contactPhoneNumber?: string;
    shortDescription?: string;
    profileThumbnail?: string;
    tags?: Tag[] | string[];
    genders?: Gender[] | string[];
    followers?: number;
    rating?: number;
    created_at?: Date;
    updated_at?: Date;
}
