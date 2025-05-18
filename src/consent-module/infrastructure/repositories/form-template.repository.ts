import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormTemplateEntity } from '../../../agenda/infrastructure/entities/formTemplate.entity';
import { IFormTemplateRepository } from '../../domain/interfaces/form-template-repository.interface';
import { CreateFormTemplateDto } from '../../domain/dtos/create-form-template.dto';
import { ConsentType } from '../../../agenda/domain/enum/consentType.enum';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';

@Injectable()
export class FormTemplateRepository implements IFormTemplateRepository {
  constructor(
    // Reminder: Ensure 'agenda' is the correct name for your TypeORM connection for this module
    @InjectRepository(FormTemplateEntity, AGENDA_DB_CONNECTION_NAME)
    private readonly repository: Repository<FormTemplateEntity>,
  ) {}

  async create(createDto: CreateFormTemplateDto): Promise<FormTemplateEntity> {
    const newTemplate = this.repository.create({
      ...createDto,
      // Ensure consentType is correctly passed if it needs transformation or validation beyond DTO
    });
    return this.repository.save(newTemplate);
  }

  async findById(id: string): Promise<FormTemplateEntity | null> {
    return this.repository.findOneBy({ id });
  }

  async findByArtist(artistId: string): Promise<FormTemplateEntity[]> {
    return this.repository.find({ where: { artistId, isActive: true } });
  }

  async findByArtistAndDetails(artistId: string, title: string, consentType: ConsentType): Promise<FormTemplateEntity | null> {
    return this.repository.findOne({ where: { artistId, title, consentType }, order: { version: 'DESC' } });
  }

  // Example for a more specific finder, e.g., by artist and type
  async findByArtistAndType(artistId: string, consentType: ConsentType): Promise<FormTemplateEntity | null> {
    return this.repository.findOne({ where: { artistId, consentType, isActive: true }, order: { version: 'DESC' } });
  }
} 