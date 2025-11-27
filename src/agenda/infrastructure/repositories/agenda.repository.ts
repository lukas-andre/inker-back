import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { is } from 'date-fns/locale';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { CreateArtistParams } from '../../../artists/usecases/interfaces/createArtist.params';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceFindException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import {
  PROBLEMS_FINDING_IF_USER_IS_RELATED_TO_EVENT,
  PROBLEMS_SAVING_AGENDA_FOR_USER,
} from '../../../users/domain/errors/codes';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';

export interface ArtistAgendaAndEventRelatedToCustomerResult {
  id: string;
  eventIsDone: boolean;
}

export interface FindRecentWorksByArtistIdsResult {
  title: string;
  customerId: string;
  workEvidence: MultimediasMetadataInterface;
  agendaId: string;
  eventId: string;
  artistId: string;
}

@Injectable()
export class AgendaRepository extends BaseComponent {
  constructor(
    @InjectRepository(Agenda, AGENDA_DB_CONNECTION_NAME)
    private readonly agendaRepository: Repository<Agenda>,
    @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(AGENDA_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(AgendaRepository.name);
  }
  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  get repo(): Repository<Agenda> {
    return this.agendaRepository;
  }

  async artistAgendaAndEventRelatedToCustomer(
    artistId: string,
    eventId: string,
    customerId: string,
  ): Promise<ArtistAgendaAndEventRelatedToCustomerResult> {
    try {
      const [agenda]: ArtistAgendaAndEventRelatedToCustomerResult[] =
        await this.agendaRepository.query(
          `SELECT a.id, e.done "eventIsDone" FROM agenda a 
         INNER JOIN agenda_event e ON e.agenda_id = a.id 
         WHERE a.artist_id = $1 AND e.id = $2 AND e.customer_id = $3`,
          [artistId, eventId, customerId],
        );
      return agenda;
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        PROBLEMS_FINDING_IF_USER_IS_RELATED_TO_EVENT,
        error,
      );
    }
  }

  async exists(id: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.agendaRepository.query(
      `SELECT EXISTS(SELECT 1 FROM agenda a WHERE a.id = $1)`,
      [id],
    );

    return result.exists;
  }

  async findById(id: string) {
    return this.agendaRepository.findOne({ where: { id } });
  }

  async findByArtistId(artistId: string) {
    return this.agendaRepository.findOne({ where: { artistId } });
  }

  async find(options: FindManyOptions<Agenda>) {
    return this.agendaRepository.find(options);
  }

  async findByKey(findConditions: FindOptionsWhere<Agenda>) {
    return this.agendaRepository.find({
      select: ['id', 'createdAt', 'updatedAt'],
      where: {
        ...findConditions,
      },
    });
  }

  // * this function could be more generic
  async createWithArtistInfo(dto: CreateArtistParams, artistId: string) {
    const agenda = {
      open: dto.agendaIsOpen,
      public: dto.agendaIsPublic,
      userId: dto.userId,
      workingDays: dto.agendaWorkingDays,
      artistId: artistId,
    } satisfies Partial<Agenda>;

    try {
      return await this.save(agenda);
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        `${PROBLEMS_SAVING_AGENDA_FOR_USER} ${dto.userId}`,
        error,
      );
    }
  }

  async findAndCount(options: FindManyOptions<Agenda>) {
    return this.agendaRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Agenda>): Promise<Agenda | undefined> {
    return this.agendaRepository.findOne(options);
  }

  async save(agenda: DeepPartial<Agenda>): Promise<Agenda> {
    try {
      return await this.agendaRepository.save(agenda);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Trouble saving agenda', error);
    }
  }

  async update(id: string, agenda: DeepPartial<Agenda>) {
    return this.agendaRepository.update(id, agenda);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.agendaRepository.delete(id);
  }

  async findRecentWorksByArtistIds(
    artistIds: string[],
  ): Promise<FindRecentWorksByArtistIdsResult[]> {
    try {
      const result: FindRecentWorksByArtistIdsResult[] = [];

      for (let i = 0; i < artistIds.length; i++) {
        const queryResult = await this.agendaRepository.query(
          `SELECT
            ae.title,
            ae.customer_id as "customerId",
            ae.work_evidence as "workEvidence",
            a.id as "agendaId",
            ae.id as "eventId",
            a.artist_id as "artistId"
          FROM agenda a
          INNER JOIN agenda_event ae ON ae.agenda_id = a.id
          WHERE a.artist_id = $1
          AND ae.done = true
          AND ae.work_evidence is not null
          ORDER BY ae.updated_at desc
          LIMIT 3`,
          [artistIds[i]],
        );

        result.push(...queryResult);
      }

      return result;
    } catch (error) {
      throw new DBServiceFindException(
        this,
        this.findRecentWorksByArtistIds.name,
        error,
      );
    }
  }

  async createEventAndInvitationTransaction(event: {
    agendaId: string;
    title: string;
    info: string;
    color: string;
    end: string;
    start: string;
    notification: boolean;
    customerId: string;
  }): Promise<{ transactionIsOK: boolean; eventId: string }> {
    let transactionIsOK = false;
    let eventId: string = undefined;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const initialStatus = AgendaEventStatus.PENDING_CONFIRMATION;
      const createEventSql = `
        INSERT INTO agenda_event (agenda_id, title, info, color, "end_date", "start_date", notification, customer_id, status, done, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, NOW(), NOW())
        RETURNING id;
      `;

      const eventParams = [
        event.agendaId,
        event.title,
        event.info,
        event.color,
        event.end,
        event.start,
        event.notification,
        event.customerId,
        initialStatus,
      ];
      const eventResult = await queryRunner.query(createEventSql, eventParams);
      eventId = eventResult[0].id;

      await queryRunner.commitTransaction();
      transactionIsOK = true;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return { transactionIsOK, eventId };
  }
}
