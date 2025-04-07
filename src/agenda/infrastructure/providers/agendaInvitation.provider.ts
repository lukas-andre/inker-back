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
import {
  AgendaInvitation,
  AgendaInvitationStatusEnum,
} from '../entities/agendaInvitation.entity';

@Injectable()
export class AgendaInvitationProvider extends BaseComponent {
  constructor(
    @InjectRepository(AgendaInvitation, AGENDA_DB_CONNECTION_NAME)
    private readonly agendaInvitationRepository: Repository<AgendaInvitation>,
    @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(AGENDA_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(AgendaInvitationProvider.name);
  }
  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  get repo(): Repository<AgendaInvitation> {
    return this.agendaInvitationRepository;
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] =
      await this.agendaInvitationRepository.query(
        `SELECT EXISTS(SELECT 1 FROM agenda_invitation a WHERE a.id = $1)`,
        [id],
      );

    return result.exists;
  }

  async findById(id: number) {
    return this.agendaInvitationRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<AgendaInvitation>) {
    return this.agendaInvitationRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<AgendaInvitation>) {
    return this.agendaInvitationRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<AgendaInvitation>,
  ): Promise<AgendaInvitation | undefined> {
    return this.agendaInvitationRepository.findOne(options);
  }

  async save(agenda: DeepPartial<AgendaInvitation>): Promise<AgendaInvitation> {
    try {
      return await this.agendaInvitationRepository.save(agenda);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Trouble saving agenda', error);
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.agendaInvitationRepository.delete(id);
  }

  async updateStatus(eventId: number, status: AgendaInvitationStatusEnum) {
    return this.agendaInvitationRepository.query(
      `UPDATE agenda_invitation SET status = $1, updated_at = now() WHERE event_id = $2`,
      [status, eventId],
    );
  }
}
