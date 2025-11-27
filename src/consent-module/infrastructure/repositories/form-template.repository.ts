import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConsentType } from '../../../agenda/domain/enum/consentType.enum';
import { FormTemplateEntity } from '../../../agenda/infrastructure/entities/formTemplate.entity';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { CreateFormTemplateDto } from '../../domain/dtos/create-form-template.dto';
import { UpdateFormTemplateDto } from '../../domain/dtos/update-form-template.dto';
import { IFormTemplateRepository } from '../../domain/interfaces/form-template-repository.interface';

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

  async findByArtistAndDetails(
    artistId: string,
    title: string,
    consentType: ConsentType,
  ): Promise<FormTemplateEntity | null> {
    return this.repository.findOne({
      where: { artistId, title, consentType },
      order: { version: 'DESC' },
    });
  }

  // Example for a more specific finder, e.g., by artist and type
  async findByArtistAndType(
    artistId: string,
    consentType: ConsentType,
  ): Promise<FormTemplateEntity | null> {
    return this.repository.findOne({
      where: { artistId, consentType, isActive: true },
      order: { version: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateFormTemplateDto,
  ): Promise<FormTemplateEntity | null> {
    const existingTemplate = await this.findById(id);
    if (!existingTemplate) {
      return null;
    }

    await this.repository.update(id, updateDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async updateStatus(
    id: string,
    isActive: boolean,
  ): Promise<FormTemplateEntity | null> {
    const existingTemplate = await this.findById(id);
    if (!existingTemplate) {
      return null;
    }

    await this.repository.update(id, { isActive });
    return this.findById(id);
  }
}
