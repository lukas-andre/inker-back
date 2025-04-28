import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { QuotationOffer } from '../entities/quotationOffer.entity';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { InjectDataSource, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BaseComponent } from '../../../global/domain/components/base.component';

@Injectable()
export class QuotationOfferRepository extends BaseComponent {
 
    constructor(
        @InjectRepository(QuotationOffer, AGENDA_DB_CONNECTION_NAME)
        private readonly quotationOfferRepository: Repository<QuotationOffer>,
        @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
        private readonly dataSource: DataSource,
        @InjectEntityManager(AGENDA_DB_CONNECTION_NAME)
        private readonly entityManager: EntityManager,
    ) {
        super(QuotationOfferRepository.name);
    }

    get repo(): Repository<QuotationOffer> {
        return this.quotationOfferRepository;
    }

    get manager(): EntityManager {
        return this.entityManager;
    }

    get source(): DataSource {
        return this.dataSource;
    }

    async findByQuotationId(quotationId: string): Promise<QuotationOffer[]> {
        return this.repo.find({ where: { quotationId } });
    }

    async findOne(options: FindOneOptions<QuotationOffer>): Promise<QuotationOffer | undefined> {
        return this.repo.findOne(options);
    }

    async find(options: FindManyOptions<QuotationOffer>): Promise<QuotationOffer[]> {
        return this.repo.find(options);
    }
} 