import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateFormTemplateDto } from '../domain/dtos/create-form-template.dto';
import { FormTemplateEntity } from '../../agenda/infrastructure/entities/formTemplate.entity';
import { FormTemplateRepository } from '../infrastructure/repositories/form-template.repository';

@Injectable()
export class CreateTemplateUseCase {
    constructor(
        private readonly formTemplateRepository: FormTemplateRepository,
    ) { }

    async execute(createDto: CreateFormTemplateDto, callingArtistId: string): Promise<FormTemplateEntity> {
        if (createDto.artistId !== callingArtistId) {
            throw new ForbiddenException('You are not authorized to create a template for this artist.');
        }

        // Check for existing template with the same title and type for this artist
        // If a match is found, it suggests a new version should be created or the existing one updated,
        // rather than creating a new distinct template with the same identifying characteristics.
        // For this use case, we'll prevent creating a new one if title and type match an existing one.
        const existingTemplateWithSameDetails = await this.formTemplateRepository.findByArtistAndDetails(
            createDto.artistId,
            createDto.title,
            createDto.consentType,
        );

        if (existingTemplateWithSameDetails) {
            // If versioning is strictly sequential and managed by this use case, you might increment here.
            // However, the DTO includes a version. If the DTO's version matches an existing one, it's a conflict.
            // If the DTO's version is higher, it could be an update (handled by a different use case).
            // For now, if any template with same title/type exists, we prevent creation to avoid confusion,
            // suggesting an update or version bump might be more appropriate.
            if (existingTemplateWithSameDetails.version === createDto.version) {
                 throw new ConflictException(
                    `A template with title '${createDto.title}', type '${createDto.consentType}', and version ${createDto.version} already exists for this artist.`
                );
            }
            // If versions differ, we could allow it, but it implies multiple active versions of the same conceptual template.
            // For stricter control, one might disallow this too and force an update/new version on the existing stream.
            // For now, we only conflict if artist, title, type AND version match.
        }

        const formTemplate = await this.formTemplateRepository.create(createDto);
        return formTemplate;
    }
} 