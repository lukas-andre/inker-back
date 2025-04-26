import { ApiProperty } from '@nestjs/swagger';

export class TattooImageDto {
  @ApiProperty({
    description: 'URL to the generated tattoo image',
    example: 'https://example.com/images/tattoo-123.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Unique identifier for the generated image',
    example: '77da2d99-a6d3-44d9-b8c0-ae9fb06b6200',
  })
  imageId: string;
  
  @ApiProperty({
    description: 'Cost of generating this specific image in USD',
    example: 0.0013,
    required: false,
  })
  cost?: number;
}

export class TattooImageResponseDto {
  @ApiProperty({
    description: 'List of generated tattoo images',
    type: [TattooImageDto],
  })
  images: TattooImageDto[];

  @ApiProperty({
    description: 'The enhanced prompt used to generate the images',
    example: 'A Hand of Fatima (Hamsa) tattoo design for forearm in pointillism style, intricate stippling technique, black ink',
  })
  enhancedPrompt: string;
  
  @ApiProperty({
    description: 'Total cost of generating all images in USD',
    example: 0.0039,
    required: false,
  })
  totalCost?: number;
} 