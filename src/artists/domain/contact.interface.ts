import { BaseModelType } from '../../global/domain/models/base.model';
import { ArtistType } from './artistType';

export interface ContactInterface extends BaseModelType {
  artist?: ArtistType;
  email: string;
  phone: string;
  phoneDialCode: string;
  phoneCountryIsoCode: string;
}
