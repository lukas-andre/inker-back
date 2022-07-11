import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { BaseService } from '../../../../global/domain/services/base.service';
import { Contact } from '../../entities/contact.entity';

export class ContactDbService extends BaseService {
  constructor(
    @InjectRepository(Contact, 'artist-db')
    private readonly contactRepository: Repository<Contact>,
  ) {
    super(ContactDbService.name);
  }

  async findById(id: number) {
    return this.contactRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Contact>) {
    return this.contactRepository.find(options);
  }

  async save(contact: Contact) {
    return this.contactRepository.save(contact);
  }

  async create() {
    return this.contactRepository.create();
  }

  async delete(id: number) {
    return this.contactRepository.delete(id);
  }
}
