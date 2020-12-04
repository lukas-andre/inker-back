import { Gender } from "../infrastructure/entities/genders.entity";
import { Tag } from "../infrastructure/entities/tag.entity";

export type ArtistTypeProps =
| 'id'
| 'userId'
| 'firstName'
| 'lastName'
| 'contactEmail'
| 'contactPhoneNumber'
| 'shortDescription'
| 'profileThumbnail'
| 'tags'
| 'genders'
| 'rating'
| 'followers'
| 'follows'
| 'created_at'
| 'updated_at';


export type ArtistType = {
    id?: number;
    username?: string;
    userId?: number;
    userTypeId?: number;
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
    follows?: number;
    created_at?: Date;
    updated_at?: Date;
};
