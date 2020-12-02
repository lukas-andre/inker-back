import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
export declare class Follower extends BaseEntity {
    artistId: string;
    userId: string;
    userTypeId: string;
    userType: string;
    username: string;
    fullname: string;
    profileThumbnail: string;
}
