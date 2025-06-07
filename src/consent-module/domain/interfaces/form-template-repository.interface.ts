import { FormTemplateEntity } from '../../../agenda/infrastructure/entities/formTemplate.entity';
import { CreateFormTemplateDto } from '../dtos/create-form-template.dto';
import { UpdateFormTemplateDto } from '../dtos/update-form-template.dto';

export interface IFormTemplateRepository {
  create(createDto: CreateFormTemplateDto): Promise<FormTemplateEntity>;
  findById(id: string): Promise<FormTemplateEntity | null>;
  findByArtist(artistId: string): Promise<FormTemplateEntity[]>;
  update(id: string, updateDto: UpdateFormTemplateDto): Promise<FormTemplateEntity | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, isActive: boolean): Promise<FormTemplateEntity | null>;
}

export const IFormTemplateRepository = Symbol('IFormTemplateRepository'); 