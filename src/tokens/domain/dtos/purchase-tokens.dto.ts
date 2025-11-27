import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export class PurchaseTokensDto {
  @ApiProperty({ description: 'Package ID to purchase' })
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ 
    description: 'Payment data (will be passed to payment gateway)',
    example: {
      paymentMethodId: 'pm_1234567890',
      returnUrl: 'https://app.example.com/tokens/purchase/confirm'
    }
  })
  @IsObject()
  @IsNotEmpty()
  paymentData: Record<string, any>;
}