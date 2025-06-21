import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IFormTemplateRepository } from '../domain/interfaces/form-template-repository.interface';
import { ISignedConsentRepository } from '../domain/interfaces/signed-consent-repository.interface';

@Injectable()
export class DeleteTemplateUseCase {
  constructor(
    @Inject(IFormTemplateRepository)
    private readonly formTemplateRepository: IFormTemplateRepository,
    @Inject(ISignedConsentRepository)
    private readonly signedConsentRepository: ISignedConsentRepository,
  ) {}

  async execute(templateId: string, callingArtistId: string): Promise<void> {
    // First, verify the template exists
    const existingTemplate = await this.formTemplateRepository.findById(
      templateId,
    );
    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    // Verify that the calling artist owns this template
    if (existingTemplate.artistId !== callingArtistId) {
      throw new ForbiddenException('You can only delete your own templates');
    }

    // Check if the template is being used in any signed consents
    const signedConsents = await this.signedConsentRepository.findByTemplateId(
      templateId,
    );
    if (signedConsents.length > 0) {
      throw new BadRequestException(
        'Cannot delete template that has been used in signed consents. Consider deactivating it instead.',
      );
    }

    // Perform the deletion
    const deleted = await this.formTemplateRepository.delete(templateId);
    if (!deleted) {
      throw new NotFoundException('Template not found during deletion');
    }
  }
}
