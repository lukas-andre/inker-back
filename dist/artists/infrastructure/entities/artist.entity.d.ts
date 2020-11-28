import { Tag } from './tag.entity';
import { Gender } from './genders.entity';
import { Follower } from './follower.entity';
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
    followers: Follower[];
    rating: number;
    created_at: Date;
    updated_at: Date;
}
