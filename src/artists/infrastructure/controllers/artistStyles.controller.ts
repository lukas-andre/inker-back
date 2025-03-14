import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArtistsHandler } from '../artists.handler';
import { ArtistStyleDto, CreateArtistStyleDto, UpdateArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';

@ApiTags('Artist Styles')
@Controller('artist-styles')
export class ArtistStylesController {
  constructor(
    private readonly artistsHandler: ArtistsHandler,
    private readonly requestContext: RequestContextService
  ) {}

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get styles for an artist' })
  @ApiResponse({
    status: 200,
    description: 'Artist styles retrieved successfully',
    type: [ArtistStyleDto],
  })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  async getArtistStyles(
    @Param('artistId') artistId: number,
  ): Promise<ArtistStyleDto[]> {
    return this.artistsHandler.getArtistStyles(Number(artistId));
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a style to artist profile' })
  @ApiResponse({
    status: 201,
    description: 'Style added successfully',
    type: ArtistStyleDto,
  })
  async addArtistStyle(
    @Body() createArtistStyleDto: CreateArtistStyleDto,
  ): Promise<ArtistStyleDto> {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistsHandler.addArtistStyle(artist.id, createArtistStyleDto);
  }

  @Put(':styleName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artist style proficiency' })
  @ApiResponse({
    status: 200,
    description: 'Style updated successfully',
    type: ArtistStyleDto,
  })
  @ApiParam({ name: 'styleName', description: 'Style name' })
  async updateArtistStyle(
    @Param('styleName') styleName: string,
    @Body() updateArtistStyleDto: UpdateArtistStyleDto,
  ): Promise<ArtistStyleDto> {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistsHandler.updateArtistStyle(artist.id, styleName, updateArtistStyleDto);
  }

  @Delete(':styleName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a style from artist profile' })
  @ApiResponse({
    status: 200,
    description: 'Style removed successfully',
  })
  @ApiParam({ name: 'styleName', description: 'Style name' })
  async removeArtistStyle(
    @Param('styleName') styleName: string,
  ): Promise<void> {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistsHandler.removeArtistStyle(artist.id, styleName);
  }
}