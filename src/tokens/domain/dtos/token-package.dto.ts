import { ApiProperty } from '@nestjs/swagger';

export class TokenPackageDto {
  @ApiProperty({ description: 'Package ID' })
  id: string;

  @ApiProperty({ description: 'Package name' })
  name: string;

  @ApiProperty({ description: 'Number of tokens in package' })
  tokens: number;

  @ApiProperty({ description: 'Price in USD' })
  price: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Price per token' })
  pricePerToken: number;

  @ApiProperty({ description: 'Savings percentage compared to base price' })
  savings: number;

  @ApiProperty({ description: 'Package description' })
  description: string;

  @ApiProperty({ description: 'Special badge text', required: false })
  badge?: string;

  static fromPackage(pkg: any): TokenPackageDto {
    const dto = new TokenPackageDto();
    dto.id = pkg.id;
    dto.name = pkg.name;
    dto.tokens = pkg.tokens;
    dto.price = pkg.price;
    dto.currency = pkg.currency;
    dto.pricePerToken = pkg.pricePerToken;
    dto.savings = pkg.savings;
    dto.description = pkg.description;
    dto.badge = pkg.badge;
    return dto;
  }
}