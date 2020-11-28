import { Follower } from '../../domain/interfaces/follower.interface';
import { CustomerFollows } from '../../../customers/domain/interfaces/customerFollows.interface';
export declare class Artist {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhoneNumber: string;
    shortDescription: string;
    profileThumbnail: string;
    follows: CustomerFollows[];
    followers: Follower[];
    rating: number;
    created_at: Date;
    updated_at: Date;
}
