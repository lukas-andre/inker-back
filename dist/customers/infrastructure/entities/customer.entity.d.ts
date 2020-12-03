import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { CustomerFollows } from '../../domain/interfaces/customerFollows.interface';
export declare class Customer extends BaseEntity {
    userId: string;
    firstName: string;
    lastName: string;
    contactEmail: string;
    contactPhoneNumber: string;
    shortDescription: string;
    profileThumbnail: string;
    follows: CustomerFollows[];
    rating: number;
}
