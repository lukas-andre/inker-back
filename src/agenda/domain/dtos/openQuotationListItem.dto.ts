import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuotationStatus, QuotationType } from '../../infrastructure/entities/quotation.entity';
import { CustomerDto } from '../../../customers/domain/dtos/customer.dto';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';

export class OpenQuotationListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  referenceImages?: MultimediasMetadataInterface;

  @ApiProperty({ enum: QuotationStatus })
  status: QuotationStatus; // Should always be OPEN in this context

  @ApiProperty({ enum: QuotationType })
  type: QuotationType; // Should always be OPEN

  @ApiProperty()
  customerLat: number;

  @ApiProperty()
  customerLon: number;

  @ApiProperty()
  customerTravelRadiusKm: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Estimated distance from artists primary location to customer location in KM',
  })
  distanceToArtistKm?: number;

  @ApiPropertyOptional({ type: () => CustomerDto })
  customer?: CustomerDto; // Include basic customer info
} 