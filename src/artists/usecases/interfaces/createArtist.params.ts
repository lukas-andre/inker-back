import { AddressInterface } from '../../../global/domain/interfaces/address.interface';

export interface CreateArtistParams {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  contactEmail?: string;
  phoneNumber?: string;
  address: AddressInterface;
  agendaWorkingDays: string[];
  agendaIsPublic: boolean;
  agendaIsOpen: boolean;
}
