import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArtistDto } from '../../artists/infrastructure/dtos/createArtist.dto';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { Agenda } from '../intrastructure/entities/agenda.entity';

@Injectable()
export class AgendaService {
  private readonly serviceName: string = AgendaService.name;

  constructor(
    @InjectRepository(Agenda, 'agenda-db')
    private readonly agendaRepository: Repository<Agenda>,
  ) {}

  async findById(id: string) {
    return this.agendaRepository.findOne(id);
  }

  async find(options: FindManyOptions<Agenda>) {
    return this.agendaRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Agenda>) {
    return this.agendaRepository.find({
      select: ['id', 'created_at', 'updated_at'],
      where: {
        ...findConditions,
      },
    });
  }

  async createWithArtistDto(dto: CreateArtistDto) {
    const agenda: Partial<Agenda> = {
      open: dto.agendaIsOpen,
      public: dto.agendaIsPublic,
      userId: dto.userId,
      workingDays: dto.agendaWorkingDays,
    };
    return this.save(agenda);
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

  async delete(id: string): Promise<DeleteResult> {
    return this.agendaRepository.delete(id);
  }
}
