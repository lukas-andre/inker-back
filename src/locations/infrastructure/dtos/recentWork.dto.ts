import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInstance,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { FindRecentWorksByArtistIdsResult } from '../../../agenda/infrastructure/providers/agenda.provider';
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
  customerId: number;

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
  @IsNumber()
  agendaId: number;

  @ApiProperty({
    description: 'The event ID',
    example: 1,
  })
  @IsNumber()
  eventId: number;

  @ApiProperty({
    description: 'The artist ID',
    example: 1,
  })
  @IsNumber()
  artistId: number;
}
