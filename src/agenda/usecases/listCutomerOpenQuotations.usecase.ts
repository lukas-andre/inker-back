import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import {
    BaseUseCase,
    UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';
import { ListOpenQuotationsQueryDto, GetOpenQuotationsResDto } from '../infrastructure/dtos/listOpenQuotationsQuery.dto';
import { QuotationStatus, QuotationType } from '../infrastructure/entities/quotation.entity';
import { OpenQuotationListItemDto } from '../domain/dtos/openQuotationListItem.dto';
import { OpenQuotationOfferDto } from '../domain/dtos/openQuotationOffer.dto';
import { QuotationOfferRepository } from '../infrastructure/repositories/quotationOffer.repository';
import { CustomerRepository } from '../../customers/infrastructure/providers/customer.repository';
import { CustomerDto } from '../../customers/domain/dtos/customer.dto';


@Injectable()
export class ListCustomerOpenQuotationsUseCase extends BaseUseCase implements UseCase {
    constructor(
        private readonly quotationRepo: QuotationRepository,
        private readonly quotationOfferRepo: QuotationOfferRepository,
        private readonly artistRepo: ArtistRepository,
        private readonly customerRepo: CustomerRepository,
    ) {
        super(ListCustomerOpenQuotationsUseCase.name);
    }

    async execute(
        customerId: string,
        queryDto: ListOpenQuotationsQueryDto,
    ): Promise<GetOpenQuotationsResDto> {
        // 1. Query open quotations for the given customer
        const queryBuilder = this.quotationRepo.repo.createQueryBuilder('q');
        queryBuilder
            .select([
                'q.id as "id"',
                'q.customerId as "customerId"',
                'q.description as "description"',
                'q.referenceImages as "referenceImages"',
                'q.status as "status"',
                'q.type as "type"',
                'q.customerLat as "customerLat"',
                'q.customerLon as "customerLon"',
                'q.customerTravelRadiusKm as "customerTravelRadiusKm"',
                'q.createdAt as "createdAt"',
                'q.updatedAt as "updatedAt"',
                'q.minBudget as "minBudget"',
                'q.maxBudget as "maxBudget"',
                'q.referenceBudget as "referenceBudget"',
                'q.generatedImageId as "generatedImageId"',
                'q.tattooDesignImageUrl as "tattooDesignImageUrl"',
            ])
            .where('q.status = :status', { status: QuotationStatus.OPEN })
            .andWhere('q.type = :type', { type: QuotationType.OPEN })
            .andWhere('q.customerId = :customerId', { customerId })
            .orderBy('q.createdAt', 'DESC');

        // Add pagination here if needed (.skip(), .take())

        this.logger.debug(`Executing query: ${queryBuilder.getSql()}`);
        const rawQuotations = await queryBuilder.getRawMany<OpenQuotationListItemDto>();

        // 2. Fetch offers for the retrieved quotations
        const quotationIds = rawQuotations.map(q => q.id);
        let offersMap = new Map<string, OpenQuotationOfferDto[]>();
        if (quotationIds.length > 0) {
            const offers = await this.quotationOfferRepo.findByQuotationIdsNative(quotationIds);
            const offerArtistIds = [...new Set(offers.map(o => o.artistId))];
            let artistNameMap = new Map<string, string>();
            if (offerArtistIds.length > 0) {
                const artists = await this.artistRepo.find({ where: { id: In(offerArtistIds) }, select: ['id', 'firstName', 'lastName'] });
                artistNameMap = new Map(artists.map(a => [a.id, `${a.firstName} ${a.lastName}`]));
            }
            offersMap = offers.reduce((map, offer) => {
                const offerDto: OpenQuotationOfferDto = {
                    id: offer.id,
                    artistId: offer.artistId,
                    artistName: artistNameMap.get(offer.artistId) ?? 'Unknown Artist',
                    estimatedCost: offer.estimatedCost,
                    message: offer.message,
                    messages: offer.messages ?? [],
                };
                const existing = map.get(offer.quotationId) || [];
                existing.push(offerDto);
                map.set(offer.quotationId, existing);
                return map;
            }, new Map<string, OpenQuotationOfferDto[]>());
        }

        // 3. Fetch customer info for all unique customerIds (should be just one, but future-proof)
        const customerIds = [...new Set(rawQuotations.map(q => q.customerId))];
        let customerMap = new Map<string, CustomerDto>();
        if (customerIds.length > 0) {
            const customers = await this.customerRepo.find({ where: { id: In(customerIds) } });
            customerMap = new Map(customers.map(c => [c.id, c as unknown as CustomerDto]));
        }

        // 4. Combine quotations with their offers and customer info
        const results: OpenQuotationListItemDto[] = rawQuotations.map(quotation => ({
            ...quotation,
            offers: offersMap.get(quotation.id) || [],
            customer: customerMap.get(quotation.customerId),
        }));

        return {
            items: results,
            total: results.length // Note: This total might need adjustment if pagination is added later
        };
    }
} 