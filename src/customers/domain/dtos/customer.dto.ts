import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { BaseDto } from '../../../global/domain/dtos/base.dto';
import { CustomerInterface } from '../interfaces/customer.interface';
import { CustomerFollows } from '../interfaces/customerFollows.interface';

export class CustomerDto extends BaseDto implements CustomerInterface {
  @ApiProperty({
    description: 'User id',
    type: Number,
    example: 1,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: 'Customer first name',
    type: String,
    example: 'Lucas',
  })
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    type: String,
    example: 'Henry',
  })
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Customer contact email',
    type: String,
    example: 'example@email.cl',
  })
  @IsString()
  @Expose()
  contactEmail: string;

  @ApiProperty({
    description: 'Customer phone number',
    type: String,
    example: '+56954484712',
  })
  @IsString()
  @Expose()
  contactPhoneNumber: string;

  @ApiProperty({
    description: 'Customer short description',
    type: String,
    example: 'Artist short description',
  })
  @IsString()
  @IsOptional()
  @Expose()
  shortDescription?: string;

  @ApiProperty({
    description: 'Customer phone number',
    type: String,
    example: 'www.example.com/artist/profile/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  @Expose()
  profileThumbnail?: string;

  @ApiProperty({
    description: 'Customer phone number',
    type: String,
    example: 'Henry',
  })
  @IsString()
  @Expose()
  follows: CustomerFollows[];

  @ApiProperty({
    description: 'Customer rating',
    type: String,
    example: 5,
  })
  @IsNumber()
  @Expose()
  rating: number;
}
