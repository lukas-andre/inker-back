import { UserType } from '../../domain/enums/userType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { AddressInterface } from '../../../global/domain/interfaces/address.interface';
import { AddressDto } from '../../../global/infrastructure/dtos/address.dto';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserReqDto {
  @ApiProperty({
    example: 'noname_eter',
    description: 'User Username',
    required: false,
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: 'Lucas',
    description: 'First Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly firstName: string;

  @ApiProperty({
    example: 'Henry',
    description: 'Last Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({
    example: 'lucas.henry@inker.cloud',
    description: 'User Email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @ApiProperty({
    example: '1qaz2wsx',
    description: 'User Passowrd',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    example: UserType.ARTIST,
    enum: [UserType.ARTIST, UserType.CUSTOMER],
    description: 'User Type',
  })
  @IsEnum(UserType)
  readonly userType: UserType;

  @ApiProperty({
    example: '+56964484712',
    description: 'User phone numer',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @ApiProperty({
    description: 'User phone numer',
    required: false,
    type: AddressDto,
  })
  @ValidateIf((v) => v.userType === UserType.ARTIST)
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address: AddressInterface;

  @ApiProperty({
    example: ['2', '3', '4', '5', '6'],
    description: 'Week working days',
    required: false,
  })
  @ValidateIf((v) => v.userType === UserType.ARTIST)
  @IsString({ each: true })
  readonly agendaWorkingDays: string[];

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda public',
    required: false,
  })
  @ValidateIf((v) => v.userType === UserType.ARTIST)
  @Transform((value) => Boolean(value === 'true' || value === true))
  readonly agendaIsPublic: boolean;

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda open',
    required: false,
  })
  @ValidateIf((v) => v.userType === UserType.ARTIST)
  @IsBoolean()
  @Transform((value) => Boolean(value === 'true' || value === true))
  readonly agendaIsOpen: boolean;
}
