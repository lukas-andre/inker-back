import { Point } from 'geojson';
import { AddressType } from '../../../global/domain/interfaces/address.interface';
import { ViewportInterface } from '../../../global/domain/interfaces/geometry.interface';
import { BaseModelType } from '../../../global/domain/models/base.model';

export interface LocationModel extends BaseModelType {
  shortAddress1: string;
  address1: string;
  address2: string;
  address3?: string;
  addressType: AddressType;
  state?: string;
  city: string;
  country?: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
  viewport?: ViewportInterface;
  location: Point;
}
