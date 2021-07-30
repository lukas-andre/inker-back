import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateCustomerParams } from '../../usecases/interfaces/createCustomer.params';

export class CreateCustomerReqDto implements CreateCustomerParams {
  @ApiProperty({
    example: 1,
    description: 'User Id',
  })
  @IsString()
  readonly userId: number;

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
    description: 'Customer phone number',
  })
  @IsString()
  readonly phoneNumber?: string;
}
