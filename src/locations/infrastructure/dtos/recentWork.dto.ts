import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInstance,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { FindRecentWorksByArtistIdsResult } from '../../../agenda/infrastructure/repositories/agenda.repository';
import { MultimediasMetadataDTO } from '../../../multimedias/dtos/multimediasMetadata.dto';

export class RecentWorkDTO implements FindRecentWorksByArtistIdsResult {
  @ApiProperty({
    description: 'The title of the work',
    example: 'Tattoo for my wife',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The customer ID',
    example: 1,
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    type: MultimediasMetadataDTO,
  })
  @ValidateNested()
  @IsInstance(MultimediasMetadataDTO)
  @Type(() => MultimediasMetadataDTO)
  workEvidence: MultimediasMetadataDTO;

  @ApiProperty({
    description: 'The agenda ID',
    example: 1,
  })
  @IsString()
  agendaId: string;

  @ApiProperty({
    description: 'The event ID',
    example: '1',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'The artist ID',
    example: '1',
  })
  @IsString()
  artistId: string;
}
