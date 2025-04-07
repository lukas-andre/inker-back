import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { TagsService } from '../../../tags/tags.service';
import { CreateTagDto } from '../../../tags/tag.dto';
import { TagSuggestionResponseDto } from '../../domain/dtos/stencil-search.dto';

@Injectable()
export class CreateTagUseCase extends BaseUseCase {
  constructor(private readonly tagsService: TagsService) {
    super(CreateTagUseCase.name);
  }

  async execute(params: CreateTagDto): Promise<TagSuggestionResponseDto> {
    try {
      // Check if tag already exists
      const existingTag = await this.tagsService.findOne({
        where: {
          name: params.name.trim().toLowerCase()
        }
      });

      if (existingTag) {
        // Return existing tag
        return {
          id: existingTag.id,
          name: existingTag.name
        };
      }

      // Create new tag
      const newTag = await this.tagsService.save({
        name: params.name.trim().toLowerCase(),
        createdBy: params.createdBy
      });

      // Return created tag
      return {
        id: newTag.id,
        name: newTag.name
      };
    } catch (error) {
      this.logger.error(`Error creating tag: ${error instanceof Error ? error.message : String(error)}`, error);
      throw error;
    }
  }
} 