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

import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import {
  ArtistStyleDto,
  CreateArtistStyleDto,
  UpdateArtistStyleDto,
} from '../../domain/dtos/artistStyle.dto';
import { ArtistsHandler } from '../artists.handler';

@ApiTags('Artist Styles')
@Controller('artist-styles')
export class ArtistStylesController {
  constructor(private readonly artistsHandler: ArtistsHandler) {}

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get styles for an artist' })
  @ApiResponse({
    status: 200,
    description: 'Artist styles retrieved successfully',
    type: [ArtistStyleDto],
  })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  async getArtistStyles(
    @Param('artistId') artistId: string,
  ): Promise<ArtistStyleDto[]> {
    const styles = await this.artistsHandler.getArtistStyles();
    return styles;
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
    return this.artistsHandler.addArtistStyle(createArtistStyleDto);
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
    return this.artistsHandler.updateArtistStyle(
      styleName,
      updateArtistStyleDto,
    );
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
    return this.artistsHandler.removeArtistStyle(styleName);
  }
}
