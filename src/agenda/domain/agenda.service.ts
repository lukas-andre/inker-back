import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CreateArtistDto } from '../../artists/infrastructure/dtos/createArtist.dto';
import { BaseService } from '../../global/domain/services/base.service';
import { Agenda } from '../infrastructure/entities/agenda.entity';

@Injectable()
export class AgendaService extends BaseService {
  constructor(
    @InjectRepository(Agenda, 'agenda-db')
    private readonly agendaRepository: Repository<Agenda>,
  ) {
    super(AgendaService.name);
  }

  async findById(id: number) {
    return this.agendaRepository.findOne(id);
  }

  async find(options: FindManyOptions<Agenda>) {
    return this.agendaRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Agenda>) {
    return this.agendaRepository.find({
      select: ['id', 'createdAt', 'updatedAt'],
      where: {
        ...findConditions,
      },
    });
  }

  // * this function could be more generic
  async createWithArtistDto(dto: CreateArtistDto) {
    const agenda: Partial<Agenda> = {
      open: dto.agendaIsOpen,
      public: dto.agendaIsPublic,
      userId: dto.userId,
      workingDays: dto.agendaWorkingDays,
    };

    try {
      return this.save(agenda);
    } catch (error) {
      return this.serviceError(
        this.createWithArtistDto,
        'Problems saving agenda',
        error.message,
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
    return this.agendaRepository.save(agenda);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.agendaRepository.delete(id);
  }
}
