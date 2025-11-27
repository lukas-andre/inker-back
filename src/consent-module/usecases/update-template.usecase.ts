import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FormTemplateDto } from '../domain/dtos/form-template.dto';
import { UpdateFormTemplateDto } from '../domain/dtos/update-form-template.dto';
import { IFormTemplateRepository } from '../domain/interfaces/form-template-repository.interface';

@Injectable()
export class UpdateTemplateUseCase {
  constructor(
    @Inject(IFormTemplateRepository)
    private readonly formTemplateRepository: IFormTemplateRepository,
  ) {}

  async execute(
    templateId: string,
    updateDto: UpdateFormTemplateDto,
    callingArtistId: string,
  ): Promise<FormTemplateDto> {
    // First, verify the template exists
    const existingTemplate = await this.formTemplateRepository.findById(
      templateId,
    );
    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    // Verify that the calling artist owns this template
    if (existingTemplate.artistId !== callingArtistId) {
      throw new ForbiddenException('You can only update your own templates');
    }

    // Perform the update
    const updatedTemplate = await this.formTemplateRepository.update(
      templateId,
      updateDto,
    );
    if (!updatedTemplate) {
      throw new NotFoundException('Template not found after update');
    }

    // Map to DTO
    return this.mapToDto(updatedTemplate);
  }

  private mapToDto(entity: any): FormTemplateDto {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      version: entity.version,
      consentType: entity.consentType,
      artistId: entity.artistId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
