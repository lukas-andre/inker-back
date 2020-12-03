import { Tag } from './tag.entity';
import { Gender } from './genders.entity';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
export declare class Artist extends BaseEntity {
    userId: number;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhoneNumber: string;
    shortDescription: string;
    profileThumbnail: string;
    tags: Tag[];
    genders: Gender[];
    rating: number;
}
