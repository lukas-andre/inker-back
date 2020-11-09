import { Follower } from '../interfaces/follower.interface';
import { CustomerFollows } from '../../customers/interfaces/customerFollows.interface';
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
