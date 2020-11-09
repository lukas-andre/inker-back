import { CustomerFollows } from '../interfaces/customerFollows.interface';
export declare class Customer {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhoneNumber: string;
    shortDescription: string;
    profileThumbnail: string;
    follows: CustomerFollows[];
    rating: number;
    created_at: Date;
    updated_at: Date;
}
