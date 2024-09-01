import { ApiProperty } from '@nestjs/swagger';

import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { QuotationCustomerAppealReason } from '../entities/quotation.entity';

export class QuotationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty()
  artistId: number;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  referenceImages?: MultimediasMetadataInterface;

  @ApiProperty({ required: false })
  proposedDesigns?: MultimediasMetadataInterface;

  @ApiProperty({
    enum: ['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'],
  })
  status:
    | 'pending'
    | 'quoted'
    | 'accepted'
    | 'rejected'
    | 'appealed'
    | 'canceled';

  @ApiProperty({ required: false })
  estimatedCost?: number;

  @ApiProperty({ required: false })
  responseDate?: Date;

  @ApiProperty({ required: false })
  appointmentDate?: Date;

  @ApiProperty({ required: false })
  appointmentDuration?: number;

  @ApiProperty({ required: false })
  rejectedReason?: string;

  @ApiProperty({ enum: ['dateChange'], required: false })
  appealedReason?: QuotationCustomerAppealReason;

  @ApiProperty({ required: false })
  appealedDate?: Date;

  @ApiProperty({
    enum: ['customer', 'artist', 'not_attended'],
    required: false,
  })
  canceledReason?: 'customer' | 'artist' | 'not_attended';

  @ApiProperty({ required: false })
  canceledDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
