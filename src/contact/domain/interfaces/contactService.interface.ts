import { ContactDto } from '../dtos/contact.dto';

export interface IContactService {
  processContactMessage(data: ContactDto): Promise<void>;
}