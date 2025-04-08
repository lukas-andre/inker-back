import { AddressInterface } from '../../../global/domain/interfaces/address.interface';
import { PhoneNumberDetailsInterface } from '../../../users/infrastructure/dtos/phoneNumberDetails.dto';

export interface CreateArtistParams {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  contactEmail?: string;
  phoneNumberDetails?: PhoneNumberDetailsInterface;
  address: AddressInterface;
  agendaWorkingDays: string[];
  agendaIsPublic: boolean;
  agendaIsOpen: boolean;
}
