import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FormTemplateEntity } from '../../agenda/infrastructure/entities/formTemplate.entity';
import { FormTemplateRepository } from '../infrastructure/repositories/form-template.repository';

@Injectable()
export class GetTemplateUseCase {
  constructor(
    private readonly formTemplateRepository: FormTemplateRepository,
  ) {}

  async execute(
    templateId: string,
    artistId?: string,
  ): Promise<FormTemplateEntity> {
    const template = await this.formTemplateRepository.findById(templateId);

    if (!template) {
      throw new NotFoundException(
        `Form template with ID ${templateId} not found.`,
      );
    }

    // If artistId is provided, ensure the template belongs to that artist (or is publicly accessible)
    // This is a basic ownership check. More complex logic (e.g. public templates) could be added.
    if (artistId && template.artistId !== artistId) {
      throw new ForbiddenException(
        'You are not authorized to access this template.',
      );
    }

    if (!template.isActive) {
      // Decide if inactive templates should be accessible, perhaps only to the owner artist
      if (artistId && template.artistId === artistId) {
        // Allow owner to see their inactive templates
      } else {
        throw new NotFoundException(
          `Form template with ID ${templateId} is not active.`,
        );
      }
    }

    return template;
  }

  async executeForArtist(artistId: string): Promise<FormTemplateEntity[]> {
    const templates = await this.formTemplateRepository.findByArtist(artistId);
    // Filter for active ones only if that's the general rule, or return all for the artist
    return templates; // .filter(t => t.isActive) if needed
  }
}
