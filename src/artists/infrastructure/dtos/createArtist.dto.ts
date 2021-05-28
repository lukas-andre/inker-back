import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { AddressInterface } from '../../../global/domain/interfaces/address.interface';
import { AddressDto } from '../../../global/infrastructure/dtos/address.dto';

export class CreateArtistDto {
  @ApiProperty({
    example: '12345',
    description: 'User Id',
  })
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    example: 'noname_eter',
    description: 'Username',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: 'Lucas',
    description: 'First Name',
  })
  @IsString()
  readonly firstName: string;

  @ApiProperty({
    example: 'Henry',
    description: 'Last Name',
  })
  @IsString()
  readonly lastName: string;

  @ApiProperty({
    example: 'test@inker.cl',
    description: 'Customer contact email',
  })
  @IsString()
  readonly contactEmail?: string;

  @ApiProperty({
    example: '+56964484712',
    description: 'Customer phone numer',
  })
  @IsString()
  readonly phoneNumber?: string;

  @ApiProperty({
    description: 'User phone numer',
    required: false,
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address: AddressInterface;

  @ApiProperty({
    example: ['2', '3', '4', '5', '6'],
    description: 'Week working days',
  })
  @IsString({ each: true })
  readonly agendaWorkingDays: string[];

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda public',
  })
  @Transform(value => Boolean(value === 'true' || value === true))
  readonly agendaIsPublic: boolean;

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda open',
  })
  @IsBoolean()
  @Transform(value => Boolean(value === 'true' || value === true))
  readonly agendaIsOpen: boolean;
}
