import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { CreateArtistParams } from '../../../artists/usecases/interfaces/createArtist.params';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { DBServiceSaveException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { PROBLEMS_SAVING_AGENDA_FOR_USER } from '../../../users/domain/errors/codes';
import { Agenda } from '../entities/agenda.entity';

@Injectable()
export class AgendaProvider extends BaseComponent {
  constructor(
    @InjectRepository(Agenda, AGENDA_DB_CONNECTION_NAME)
    private readonly agendaRepository: Repository<Agenda>, // @InjectDataSource(AGENDA_DB_CONNECTION_NAME) // private readonly dataSource: DataSource, // @InjectEntityManager(AGENDA_DB_CONNECTION_NAME) // private readonly entityManager: EntityManager,
  ) {
    super(AgendaProvider.name);
  }
  // get source(): DataSource {
  //   return this.dataSource;
  // }

  // get manager(): EntityManager {
  //   return this.entityManager;
  // }

  get repo(): Repository<Agenda> {
    return this.agendaRepository;
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.agendaRepository.query(
      `SELECT EXISTS(SELECT 1 FROM agenda a WHERE a.id = $1)`,
      [id],
    );

    return result.exists;
  }

  async findById(id: number) {
    return this.agendaRepository.findOne({ where: { id } });
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
  async createWithArtistInfo(dto: CreateArtistParams, artistId: number) {
    const agenda: Partial<Agenda> = {
      open: dto.agendaIsOpen,
      public: dto.agendaIsPublic,
      userId: dto.userId,
      workingDays: dto.agendaWorkingDays,
      // artistId: artistId,
    };

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

  async delete(id: number): Promise<DeleteResult> {
    return this.agendaRepository.delete(id);
  }
}
