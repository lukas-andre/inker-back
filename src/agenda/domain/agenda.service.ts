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
import { CreateArtistParams } from '../../artists/usecases/interfaces/createArtist.params';
import { BaseComponent } from '../../global/domain/components/base.component';
import { DBServiceSaveException } from '../../global/infrastructure/exceptions/dbService.exception';
import { PROBLEMS_SAVING_AGENDA_FOR_USER } from '../../users/domain/errors/codes';
import { Agenda } from '../infrastructure/entities/agenda.entity';

@Injectable()
export class AgendaService extends BaseComponent {
  constructor(
    @InjectRepository(Agenda, 'agenda-db')
    private readonly agendaRepository: Repository<Agenda>,
  ) {
    super(AgendaService.name);
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
  async createWithArtistInfo(dto: CreateArtistParams) {
    const agenda: Partial<Agenda> = {
      open: dto.agendaIsOpen,
      public: dto.agendaIsPublic,
      userId: dto.userId,
      workingDays: dto.agendaWorkingDays,
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
