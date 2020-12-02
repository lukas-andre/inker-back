import { Gender } from "../infrastructure/entities/genders.entity";
import { Tag } from "../infrastructure/entities/tag.entity";
export declare type ArtistTypeProps = 'id' | 'userId' | 'firstName' | 'lastName' | 'contactEmail' | 'contactPhoneNumber' | 'shortDescription' | 'profileThumbnail' | 'tags' | 'genders' | 'rating' | 'followers' | 'created_at' | 'updated_at';
export declare type ArtistType = {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    contactEmail?: string;
    contactPhoneNumber?: string;
    shortDescription?: string;
    profileThumbnail?: string;
    tags?: string[] | Tag[];
    genders?: string[] | Gender[];
    rating?: number;
    followers?: number;
    created_at?: Date;
    updated_at?: Date;
};
