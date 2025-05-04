import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateQuotationOfferReqDto } from '../infrastructure/dtos/updateQuotationOfferReq.dto';
import { QuotationOfferRepository } from '../infrastructure/repositories/quotationOffer.repository';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { BaseComponent } from '../../global/domain/components/base.component';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';

@Injectable()
export class UpdateQuotationOfferUseCase extends BaseComponent {
  constructor(
    private readonly quotationOfferRepository: QuotationOfferRepository,
    private readonly quotationRepository: QuotationRepository,
    private readonly artistRepository: ArtistRepository,
  ) {
    super(UpdateQuotationOfferUseCase.name);
  }

  async execute(
    quotationId: string, 
    offerId: string, 
    artistId: string, 
    dto: UpdateQuotationOfferReqDto
  ): Promise<void> {
    // Verify the quotation exists
    const quotation = await this.quotationRepository.findOne({
      where: { id: quotationId }
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }

    // Verify offer exists
    const offer = await this.quotationOfferRepository.findOne({
      where: { id: offerId, quotationId }
    });

    if (!offer) {
      throw new NotFoundException(`Quotation offer with ID ${offerId} not found`);
    }

    // Verify the artist is the owner of the offer
    if (offer.artistId !== artistId) {
      throw new UnauthorizedException('You can only update your own quotation offers');
    }

    // Check if at least one field to update is provided
    if (!dto.estimatedCost && dto.estimatedDuration === undefined) {
      throw new Error('At least one field to update must be provided');
    }

    // Update the offer
    const updateData: any = {};
    
    if (dto.estimatedCost) {
      updateData.estimatedCost = dto.estimatedCost;
    }
    
    if (dto.estimatedDuration !== undefined) {
      updateData.estimatedDuration = dto.estimatedDuration;
    }

    // Use the repository to update the offer
    await this.quotationOfferRepository.repo.update(
      { id: offerId },
      updateData
    );
  }
} 