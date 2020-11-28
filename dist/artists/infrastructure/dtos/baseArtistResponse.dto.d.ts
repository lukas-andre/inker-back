import { Follower } from '../entities/follower.entity';
import { Gender } from '../entities/genders.entity';
import { Tag } from '../entities/tag.entity';
export declare class BaseArtistResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhoneNumber?: string;
    shortDescription?: string;
    profileThumbnail?: string;
    tags?: Tag[];
    genders?: Gender[];
    followers?: Follower[];
    rating: number;
    created_at: Date;
    updated_at: Date;
}
