import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { DBServiceSaveException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { Quotation } from '../entities/quotation.entity';

@Injectable()
export class QuotationProvider extends BaseComponent {
  constructor(
    @InjectRepository(Quotation, AGENDA_DB_CONNECTION_NAME)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(AGENDA_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(QuotationProvider.name);
  }

  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  get repo(): Repository<Quotation> {
    return this.quotationRepository;
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.quotationRepository.query(
      `SELECT EXISTS(SELECT 1 FROM quotation q WHERE q.id = $1)`,
      [id],
    );

    return result.exists;
  }

  async findById(id: number) {
    return this.quotationRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Quotation>) {
    return this.quotationRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<Quotation>) {
    return this.quotationRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Quotation>,
  ): Promise<Quotation | undefined> {
    return this.quotationRepository.findOne(options);
  }

  async save(quotation: DeepPartial<Quotation>): Promise<Quotation> {
    try {
      return await this.quotationRepository.save(quotation);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Trouble saving quotation', error);
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.quotationRepository.delete(id);
  }

  async updateStatus(
    id: number,
    status: 'pending' | 'accepted' | 'rejected' | 'appealed' | 'canceled',
  ) {
    return this.quotationRepository.query(
      `UPDATE quotation SET status = $1, updated_at = now() WHERE id = $2`,
      [status, id],
    );
  }
}
