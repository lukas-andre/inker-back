import { GeometryInterface } from './geometry.interface';

export enum AddressType {
  HOME = 'HOME',
  DEPARTMENT = 'DEPARTMENT',
  STUDIO = 'STUDIO',
  OFFICE = 'OFFICE',
}
export interface AddressInterface {
  address1: string;
  address2: string;
  address3?: string;
  addressType: AddressType;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  googlePlaceId?: string;
  geometry?: GeometryInterface;
}
