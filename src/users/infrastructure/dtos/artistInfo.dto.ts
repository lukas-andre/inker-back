import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressInterface } from '../../../global/domain/interfaces/address.interface';
import { AddressDto } from '../../../global/infrastructure/dtos/address.dto';

export class ArtistInfoDto implements ArtistInfoInterface {
  @ApiProperty({
    description: 'Address',
    required: false,
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address: AddressDto;

  @ApiProperty({
    example: ['2', '3', '4', '5', '6'],
    description: 'Week working days',
    required: false,
  })
  @IsString({ each: true })
  @ArrayMaxSize(7)
  readonly agendaWorkingDays: string[];

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda public',
    required: false,
  })
  @IsBoolean()
  @Transform(value => Boolean(value.value === 'true' || value.value === true))
  readonly agendaIsPublic: boolean;

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda open',
    required: false,
  })
  @IsBoolean()
  @Transform(value => Boolean(value.value === 'true' || value.value === true))
  readonly agendaIsOpen: boolean;
}

export class ArtistInfoInterface {
  address: AddressInterface;
  agendaWorkingDays: string[];
  agendaIsPublic: boolean;
  agendaIsOpen: boolean;
}
