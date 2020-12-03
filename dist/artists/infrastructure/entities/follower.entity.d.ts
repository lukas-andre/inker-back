import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
export declare class Follower extends BaseEntity {
    artistId: number;
    userId: number;
    userTypeId: number;
    userType: string;
    username: string;
    fullname: string;
    profileThumbnail: string;
}
