import { Tag } from './tag.entity';
import { Gender } from './genders.entity';
export declare class Artist {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhoneNumber: string;
    shortDescription: string;
    profileThumbnail: string;
    tags: Tag[];
    genders: Gender[];
    rating: number;
    created_at: Date;
    updated_at: Date;
}
