import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { AgendaUnavailableTime } from '../entities/agendaUnavailableTime.entity';

@Injectable()
export class AgendaUnavailableTimeProvider {
  constructor(
    @InjectRepository(AgendaUnavailableTime, AGENDA_DB_CONNECTION_NAME)
    private repository: Repository<AgendaUnavailableTime>,
  ) {}

  create(agendaUnavailableTime: Partial<AgendaUnavailableTime>): Promise<AgendaUnavailableTime> {
    return this.repository.save(agendaUnavailableTime);
  }

  findAll(): Promise<AgendaUnavailableTime[]> {
    return this.repository.find();
  }

  findOne(id: number): Promise<AgendaUnavailableTime> {
    return this.repository.findOne({ where: { id } });
  }

  findByAgendaId(agendaId: number): Promise<AgendaUnavailableTime[]> {
    return this.repository.find({ where: { agendaId } });
  }
  
  findByDateRange(agendaId: number, startDate: Date, endDate: Date): Promise<AgendaUnavailableTime[]> {
    return this.repository.find({
      where: {
        agendaId,
        startDate: Between(startDate, endDate),
      },
    });
  }

  findOverlapping(agendaId: number, startDate: Date, endDate: Date): Promise<AgendaUnavailableTime[]> {
    return this.repository
      .createQueryBuilder('unavailableTime')
      .where('unavailableTime.agendaId = :agendaId', { agendaId })
      .andWhere(
        '(unavailableTime.startDate <= :endDate AND unavailableTime.endDate >= :startDate)',
        { startDate, endDate },
      )
      .getMany();
  }

  update(id: number, agendaUnavailableTime: Partial<AgendaUnavailableTime>): Promise<any> {
    return this.repository.update(id, agendaUnavailableTime);
  }

  remove(id: number): Promise<any> {
    return this.repository.delete(id);
  }
}