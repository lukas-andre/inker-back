import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTattooImageDto } from '../../domain/dto/create-tattoo-image.dto';
import { TattooImageResponseDto } from '../../domain/dto/tattoo-image-response.dto';
import { GenerateTattooImagesUseCase } from '../../usecases/generateTattooImages.usecase';

@ApiTags('tattoo-generator')
@Controller('tattoo-generator')
export class TattooGeneratorController {
  constructor(
    private readonly generateTattooImagesUseCase: GenerateTattooImagesUseCase,
  ) {}

  @Post('generate')
  @ApiOperation({ 
    summary: 'Generate tattoo design images based on style and user input',
    description: 'Generates tattoo designs using the specified style and user input. Returns multiple design options with their image URLs.',
  })
  @ApiResponse({
    status: 201,
    description: 'The tattoo images have been successfully generated',
    type: TattooImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateTattooImages(@Body() createTattooImageDto: CreateTattooImageDto): Promise<TattooImageResponseDto> {
    return this.generateTattooImagesUseCase.execute({
      style: createTattooImageDto.style,
      userInput: createTattooImageDto.userInput,
    });
  }
} 