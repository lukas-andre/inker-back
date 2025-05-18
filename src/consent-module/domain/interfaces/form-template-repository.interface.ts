import { FormTemplateEntity } from '../../../agenda/infrastructure/entities/formTemplate.entity';
import { CreateFormTemplateDto } from '../dtos/create-form-template.dto';

export interface IFormTemplateRepository {
  create(createDto: CreateFormTemplateDto): Promise<FormTemplateEntity>;
  findById(id: string): Promise<FormTemplateEntity | null>;
  findByArtist(artistId: string): Promise<FormTemplateEntity[]>;
  // Add other methods like update, delete, findAll as needed
}

export const IFormTemplateRepository = Symbol('IFormTemplateRepository'); 