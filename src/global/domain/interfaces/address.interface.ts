import { GeometryInterface } from './geometry.interface';

export interface AddressInterface {
  address1: string;
  address2: string;
  address3?: string;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  googlePlaceId?: string;
  geometry?: GeometryInterface;
}
