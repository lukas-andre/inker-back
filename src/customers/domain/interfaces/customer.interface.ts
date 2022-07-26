import { CustomerFollows } from './customerFollows.interface';

export interface CustomerInterface {
  userId: number;
  firstName: string;
  lastName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  shortDescription?: string;
  profileThumbnail?: string;
  follows: CustomerFollows[];
  rating: number;
}
